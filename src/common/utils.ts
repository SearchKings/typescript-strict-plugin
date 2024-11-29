import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function getPosixFilePath(filePath: string) {
  return filePath.split(path.sep).join(path.posix.sep);
}

export function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`;
}

export function isFile(path: string) {
  try {
    const stats = fs.statSync(path);

    return stats.isFile();
  } catch {
    return false;
  }
}

export function getProjectPathFromArgs(): string | undefined {
  const args = process.argv.slice(2);

  console.log('getProjectPathFromArgs', args);

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--project') {
      return path.dirname(args[index + 1]);
    }
  }
}

/**
 * Parses command-line arguments to extract TypeScript configuration details.
 *
 * This function processes the command-line arguments using `yargs`, identifies any custom
 * TypeScript configuration file specified via the `tsconfig` argument, and formats
 * other arguments for use with the TypeScript Compiler (TSC). Additionally, it resolves
 * the full path to the specified or default `tsconfig.json` file.
 *
 * @returns {Object} An object containing:
 *   - `argv` {string[]}: An array of arguments formatted for TSC (e.g., `--key value`),
 *     excluding certain defaults like `_`, `$0`, `project`, and `tsconfig`.
 *   - `tsConfigFile` {string}: The name of the TypeScript configuration file to use,
 *     defaulting to `tsconfig.json` if no custom file is specified.
 *   - `tsConfig` {string}: The absolute path to the resolved TypeScript configuration file.
 */
export const getArgs = (): { argv: string[]; tsConfigFile: string; tsConfig: string } => {
  let tsConfigFile: string = 'tsconfig.json';
  const args = yargs(hideBin(process.argv)).parse();
  const argv = Object.entries(args).reduce<string[]>((acc, arg) => {
    const [key, value] = arg;

    if (key === 'tsconfig') {
      tsConfigFile = value;
    }

    if (key !== '_' && key !== '$0' && key !== 'project' && key !== 'tsconfig') {
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
