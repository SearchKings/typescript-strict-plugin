export interface Config {
  paths?: string[];
  exclude?: string[];
  excludePattern?: string[];
}

export interface ConfigInternal {
  hasPluginConfigured?: boolean;
  tsConfigFile?: string | undefined;
}
