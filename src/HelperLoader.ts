// Taken directly from the Obsidian Templater plugin: https://github.com/SilentVoid13/Templater/blob/master/src/UserTemplates/UserTemplateParser.ts
import { App, FileSystemAdapter, TFile } from "obsidian";
import { FunctionMap } from "./main";
import { getTFilesFromFolder } from "./Utils";

export class HelperLoader {
  async loadFunctions(app: App, scriptFolder: string): Promise<FunctionMap> {
    let files = getTFilesFromFolder(app, scriptFolder);

    const allFunctionPromises = files.map(
      (file): Promise<FunctionMap> => {
        return file.extension.toLowerCase() === "js"
          ? this.getFunctionsFromFile(app, file)
          : Promise.resolve({});
      }
    );

    return Promise.all(allFunctionPromises).then((maps: FunctionMap[]) =>
      Object.assign({}, ...maps)
    );
  }

  async getFunctionsFromFile(app: App, file: TFile): Promise<FunctionMap> {
    if (!(app.vault.adapter instanceof FileSystemAdapter)) {
      throw new Error("app.vault is not a FileSystemAdapter instance");
    }
    let vaultPath = app.vault.adapter.getBasePath();
    let filePath = `${vaultPath}/${file.path}`;

    // https://stackoverflow.com/questions/26633901/reload-module-at-runtime
    // https://stackoverflow.com/questions/1972242/how-to-auto-reload-files-in-node-js
    if (Object.keys(window.require.cache).contains(filePath)) {
      delete window.require.cache[window.require.resolve(filePath)];
    }

    const functions: FunctionMap = {};
    const userFunction = await import(filePath);

    for (const key of Object.keys(userFunction)) {
      if (userFunction[key] instanceof Function) {
        functions[key] = userFunction[key];
      }
    }
    return functions;
  }
}
