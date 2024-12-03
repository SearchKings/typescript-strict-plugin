export interface Config {
  paths?: string[];
  exclude?: string[];
  excludePattern?: string[];
  relaxed?: boolean;
}

export interface ConfigInternal {
  hasPluginConfigured?: boolean;
  tsConfigFile?: string | undefined;
}
