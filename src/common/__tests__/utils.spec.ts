import path from 'path';
import { getProjectPathFromArgs, getArgs } from '../utils';

let globalProcessArgv: string[];

describe('utils', () => {
  describe('getProjectPathFromArgs', () => {
    beforeEach(() => {
      globalProcessArgv = process.argv;
    });

    afterEach(() => {
      process.argv = globalProcessArgv;
    });

    it('should return undefined if --project not present in path', () => {
      process.argv = [
        '/usr/bin/nodejs/18.7.0/bin/node',
        '/home/neenjaw/typescript-strict-plugin/node_modules/.bin/update-strict-comments',
      ];

      expect(getProjectPathFromArgs()).toEqual(undefined);
    });

    it('should return undefined if --project not present in path', () => {
      process.argv = [
        '/usr/bin/nodejs/18.7.0/bin/node',
        '/home/neenjaw/typescript-strict-plugin/node_modules/.bin/update-strict-comments',
        '--project',
        './some/inner/project/tsconfig.json',
      ];

      expect(getProjectPathFromArgs()).toEqual('./some/inner/project');
    });

    describe('utils', () => {
      describe('getProjectPathFromArgs', () => {
        beforeEach(() => {
          globalProcessArgv = process.argv;
        });

        afterEach(() => {
          process.argv = globalProcessArgv;
        });

        it('should return undefined if --project not present in path', () => {
          process.argv = [
            '/usr/bin/nodejs/18.7.0/bin/node',
            '/home/neenjaw/typescript-strict-plugin/node_modules/.bin/update-strict-comments',
          ];

          expect(getProjectPathFromArgs()).toEqual(undefined);
        });

        it('should return the project path if --project is present in path', () => {
          process.argv = [
            '/usr/bin/nodejs/18.7.0/bin/node',
            '/home/neenjaw/typescript-strict-plugin/node_modules/.bin/update-strict-comments',
            '--project',
            './some/inner/project/tsconfig.json',
          ];

          expect(getProjectPathFromArgs()).toEqual('./some/inner/project');
        });
      });

      describe('getArgs', () => {
        beforeEach(() => {
          globalProcessArgv = process.argv;
        });

        afterEach(() => {
          process.argv = globalProcessArgv;
        });

        it('should return default tsconfig.json if no tsconfig argument is provided', () => {
          process.argv = [
            '/usr/bin/nodejs/18.7.0/bin/node',
            '/home/neenjaw/typescript-strict-plugin/node_modules/.bin/update-strict-comments',
          ];

          const result = getArgs();
          expect(result.tsConfigFile).toEqual('tsconfig.json');
          expect(result.tsConfig).toEqual(`${path.resolve()}/tsconfig.json`);
        });

        it('should return custom tsconfig file if tsconfig argument is provided', () => {
          process.argv = [
            '/usr/bin/nodejs/18.7.0/bin/node',
            '/home/neenjaw/typescript-strict-plugin/node_modules/.bin/update-strict-comments',
            '--tsconfig',
            'custom-tsconfig.json',
          ];

          const result = getArgs();
          expect(result.tsConfigFile).toEqual('custom-tsconfig.json');
          expect(result.tsConfig).toEqual(`${path.resolve()}/custom-tsconfig.json`);
        });

        it('should return formatted argv excluding certain defaults', () => {
          process.argv = [
            '/usr/bin/nodejs/18.7.0/bin/node',
            '/home/neenjaw/typescript-strict-plugin/node_modules/.bin/update-strict-comments',
            '--tsconfig',
            'custom-tsconfig.json',
            '--someKey',
            'someValue',
          ];

          const result = getArgs();
          expect(result.argv).toEqual(['--someKey', 'someValue']);
        });
      });
    });
  });
});
