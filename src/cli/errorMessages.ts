import { ConfigInternal } from '../common/types';

export const notConfiguredError = (tsConfigFile: ConfigInternal['tsConfigFile']) => `
The "typescript-strict-plugin" isn't configured in [${
  tsConfigFile ? tsConfigFile : 'tsconfig.json'
}], please add following configuration:

{
  "compilerOptions": {
    ...
    "plugins": [{
      "name": "typescript-strict-plugin"
    }]
  },
}

`;

export const noStrictFilesError = `
Project does not contain any strict files.
`;
