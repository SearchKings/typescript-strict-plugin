import execa, { ExecaError } from 'execa';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ConfigInternal } from '../../common/types';

/**
 * Retrieves and displays the raw TypeScript Compiler (TSC) configuration.
 *
 * This function resolves the TypeScript project path dynamically, including support for
 * custom `tsconfig.json` file names. It executes the TSC CLI with the `--showConfig`
 * option to output the resolved configuration as a string. Designed for flexible setups,
 * such as monorepos with multiple applications, libraries, or packages.
 *
 * @async
 * @returns {Promise<Object>} A promise resolving to an object containing:
 *   - `tscConfigRaw`: The raw JSON string of the resolved TypeScript configuration.
 *   - `tsConfigFile`: The name of the custom TypeScript configuration file used,
 *     or `undefined` if the default `tsconfig.json` was applied.
 *
 * @example
 * const config = await showConfig();
 * console.log(config.tscConfigRaw);
 */
export const showConfig = async (): Promise<{
  tscConfigRaw: string;
  tsConfigFile: ConfigInternal['tsConfigFile'];
}> => {
  const { argv, tsConfigFile } = getArgs();
  const projectPath = `${path.resolve()}/${tsConfigFile ? tsConfigFile : 'tsconfig.json'}`;
  const output = await execa('tsc', [...argv, '--showConfig', '--project', projectPath], {
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
  if (compilerOutputCache) {
    return compilerOutputCache;
  }

  try {
    const compilerResult = await execa(
      'tsc',
      [...process.argv.slice(2), '--strict', '--noEmit', '--pretty', 'false', '--listFiles'],
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
 * Parses command-line arguments and extracts TypeScript configuration details.
 *
 * This function uses `yargs` to parse command-line arguments and processes them
 * into an array of argument strings suitable for passing to the TypeScript Compiler (TSC).
 * It also identifies the custom TypeScript configuration file name if provided.
 *
 * @returns {Object} An object containing:
 *   - `argv`: An array of processed arguments excluding the defaults (`_`, `$0`, `project`, `tsConfigName`).
 *   - `tsConfigFile`: The name of the custom TypeScript configuration file, or `undefined` if not specified.
 */
const getArgs = (): { argv: string[]; tsConfigFile: string | undefined } => {
  let tsConfigFile: string | undefined;
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
  };
};

function isExecaError(error: unknown): error is ExecaError {
  return typeof (error as ExecaError)?.all === 'string';
}

function wasCompileAborted(error: ExecaError): boolean {
  return error.signal === 'SIGABRT' || error.exitCode === 134;
}
