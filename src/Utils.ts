import {
  App,
  normalizePath,
  TAbstractFile,
  TFile,
  TFolder,
  Vault,
} from "obsidian";

export const obsidian_module = require("obsidian");

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function resolveTFile(app: App, file_str: string): TFile {
  file_str = normalizePath(file_str);

  const file = app.vault.getAbstractFileByPath(file_str);
  if (!file) {
    throw new Error(`File "${file_str}" doesn't exist`);
  }
  if (!(file instanceof TFile)) {
    throw new Error(`${file_str} is a folder, not a file`);
  }

  return file;
}

export function getTFilesFromFolder(
  app: App,
  folder_str: string
): Array<TFile> {
  folder_str = normalizePath(folder_str);

  const folder = app.vault.getAbstractFileByPath(folder_str);
  if (!folder) {
    throw new Error(`Folder "${folder_str}" doesn't exist`);
  }
  if (!(folder instanceof TFolder)) {
    throw new Error(`${folder_str} is a file, not a folder`);
  }

  let files: Array<TFile> = [];
  Vault.recurseChildren(folder, (file: TAbstractFile) => {
    if (file instanceof TFile) {
      files.push(file);
    }
  });

  files.sort((a, b) => {
    return a.basename.localeCompare(b.basename);
  });

  return files;
}
