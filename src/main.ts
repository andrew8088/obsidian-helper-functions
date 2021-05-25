import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { HelperLoader } from "./HelperLoader";

interface HelperFnsPluginSettings {
  scriptFolder: string;
  addToApp: boolean;
  appFieldName: string;
}

const DEFAULT_SETTINGS: HelperFnsPluginSettings = {
  scriptFolder: "scripts",
  addToApp: false,
  appFieldName: "fns",
};

export type FunctionMap = { [key: string]: Function };

export default class HelperFnsPlugin extends Plugin {
  settings: HelperFnsPluginSettings;
  fns: FunctionMap = {};

  loader = new HelperLoader();

  async onload() {
    console.log("loading HelperFns plugin");

    await this.loadSettings();

    this.addCommand({
      id: "helperfns-reload-scripts",
      name: "HelperFns: Reload scripts",
      callback: () => this.loadFns(),
    });

    this.addSettingTab(new HelperFnsSettingsTab(this.app, this));
  }

  async loadFns() {
    this.fns = await this.loader.loadFunctions(
      this.app,
      this.settings.scriptFolder
    );

    if (this.settings.addToApp) {
      //@ts-ignore
      this.app[this.settings.appFieldName] = this.fns;
    }
  }

  onunload() {
    console.log("unloading HelperFns plugin");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class HelperFnsSettingsTab extends PluginSettingTab {
  plugin: HelperFnsPlugin;

  constructor(app: App, plugin: HelperFnsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Script files folder location")
      .addText((text) => {
        text
          .setPlaceholder("Example: folder 1/folder 2")
          .setValue(this.plugin.settings.scriptFolder)
          .onChange((new_folder) => {
            this.plugin.settings.scriptFolder = new_folder;
            this.plugin.saveSettings();
            this.plugin.loadFns();
          });
      });

    new Setting(containerEl)
      .setName("Add helper functions to the `app` object")
      .setDesc(
        "For easier access, the helper functions will be accessible from the `app` object"
      )
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.addToApp).onChange((addToApp) => {
          this.plugin.settings.addToApp = addToApp;
          this.plugin.saveSettings();
          this.plugin.loadFns();
          // Force refresh
          this.display();
        });
      });

    if (this.plugin.settings.addToApp) {
      new Setting(containerEl).setName("`app` field name").addText((text) => {
        text
          .setPlaceholder("Example: fns")
          .setValue(this.plugin.settings.appFieldName)
          .onChange((appFieldName) => {
            this.plugin.settings.appFieldName = appFieldName;
            this.plugin.saveSettings();
            this.plugin.loadFns();
          });
      });
    }
  }
}
