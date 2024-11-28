import execa, { ExecaError } from 'execa';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ConfigInternal } from '../../common/types';

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
 *     which defaults to `tsconfig.json` unless overridden by `tsConfigName`.
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

  if (compilerOutputCache) {
    return compilerOutputCache;
  }

  try {
    const compilerResult = await execa(
      'tsc',
      [...argv, '--strict', '--noEmit', '--pretty', 'false', '--listFiles', '--project', tsConfig],
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

/**
 * Parses command-line arguments to extract TypeScript configuration details.
 *
 * This function processes the command-line arguments using `yargs`, identifies any custom
 * TypeScript configuration file specified via the `tsConfigName` argument, and formats
 * other arguments for use with the TypeScript Compiler (TSC). Additionally, it resolves
 * the full path to the specified or default `tsconfig.json` file.
 *
 * @returns {Object} An object containing:
 *   - `argv` {string[]}: An array of arguments formatted for TSC (e.g., `--key value`),
 *     excluding certain defaults like `_`, `$0`, `project`, and `tsConfigName`.
 *   - `tsConfigFile` {string}: The name of the TypeScript configuration file to use,
 *     defaulting to `tsconfig.json` if no custom file is specified.
 *   - `tsConfig` {string}: The absolute path to the resolved TypeScript configuration file.
 */
const getArgs = (): { argv: string[]; tsConfigFile: string; tsConfig: string } => {
  let tsConfigFile: string = 'tsconfig.json';
  const args = yargs(hideBin(process.argv)).parse();
  const argv = Object.entries(args).reduce<string[]>((acc, arg) => {
    const [key, value] = arg;

    if (key === 'tsConfigName') {
      tsConfigFile = value;
    }

    if (key !== '_' && key !== '$0' && key !== 'project' && key !== 'tsConfigName') {
      acc.push(...[`--${key}`, value]);
    }

    return acc;
  }, []);

  return {
    argv,
    tsConfigFile,
    tsConfig: `${path.resolve()}/${tsConfigFile}`,
  };
};

function isExecaError(error: unknown): error is ExecaError {
  return typeof (error as ExecaError)?.all === 'string';
}

function wasCompileAborted(error: ExecaError): boolean {
  return error.signal === 'SIGABRT' || error.exitCode === 134;
}
