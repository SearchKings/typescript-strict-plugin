import execa, { ExecaError } from 'execa';
import { ConfigInternal } from '../../common/types';
import { getArgs } from '../../common/utils';
import { getPluginConfig } from '../getPluginConfig';

/**
 * Retrieves and displays the resolved TypeScript configuration from TSC.
 *
 * This function dynamically resolves the TypeScript project path and executes
 * the TSC CLI with the `--showConfig` option to retrieve the fully resolved configuration.
 * It supports custom `tsconfig.json` file names and adapts to various project structures,
 * such as monorepos.
 *
 * @async
 * @returns {Promise<Object>} A promise resolving to an object containing:
 *   - `tscConfigRaw` {string}: The raw JSON string of the resolved TypeScript configuration.
 *   - `tsConfigFile` {string}: The name of the TypeScript configuration file used,
 *     which defaults to `tsconfig.json` unless overridden by `tsconfig`.
 */
export const showConfig = async (): Promise<{
  tscConfigRaw: string;
  tsConfigFile: ConfigInternal['tsConfigFile'];
}> => {
  const { argv, tsConfigFile, tsConfig } = getArgs();
  const output = await execa('tsc', [...argv, '--showConfig', '--project', tsConfig], {
    all: true,
    preferLocal: true,
  });

  return {
    tscConfigRaw: output.stdout,
    tsConfigFile,
  };
};

let compilerOutputCache = '';
export const compile = async (): Promise<string> => {
  const { argv, tsConfig } = getArgs();
  const pluginConfig = await getPluginConfig();

  if (compilerOutputCache) {
    return compilerOutputCache;
  }

  try {
    const compilerResult = await execa(
      'tsc',
      [
        ...argv,
        ...(!pluginConfig?.relaxed ? ['--strict'] : []),
        '--noEmit',
        '--pretty',
        'false',
        '--listFiles',
        '--project',
        tsConfig,
      ],
      {
        all: true,
        preferLocal: true,
      },
    );

    compilerOutputCache = compilerResult.stdout;
  } catch (error) {
    if (isExecaError(error) && error.all) {
      if (wasCompileAborted(error)) {
        console.log(`💥 Typescript task was aborted. Full error log: `, error.all);
        process.exit(error.exitCode ?? 1);
      }

      compilerOutputCache = error.all;
    }
  }

  return compilerOutputCache;
};

function isExecaError(error: unknown): error is ExecaError {
  return typeof (error as ExecaError)?.all === 'string';
}

function wasCompileAborted(error: ExecaError): boolean {
  return error.signal === 'SIGABRT' || error.exitCode === 134;
}
