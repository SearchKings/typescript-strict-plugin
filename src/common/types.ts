export interface Config {
  paths?: string[];
  exclude?: string[];
  excludePattern?: string[];
}

export interface ConfigInternal {
  tsConfigFile?: string | undefined;
}
