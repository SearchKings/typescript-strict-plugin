import { findStrictErrors } from '../../findStrictErrors';
import { findStrictFiles } from '../../findStrictFiles';
import { run } from '../index';
import { getPluginConfig } from '../../getPluginConfig';

jest.mock('../../getPluginConfig', () => ({
  getPluginConfig: jest.fn(),
}));

jest.mock('../../findStrictFiles', () => ({
  findStrictFiles: jest.fn(),
}));

jest.mock('../../findStrictErrors', () => ({
  findStrictErrors: jest.fn(),
}));

const getPluginConfigMock = jest.mocked(getPluginConfig);
const findStrictFilesMock = jest.mocked(findStrictFiles);
const findStrictErrorsMock = jest.mocked(findStrictErrors);

jest.spyOn(process, 'exit').mockImplementation();
jest.spyOn(console, 'log').mockImplementation();

describe('tsc-strict root', () => {
  afterEach(() => {
    jest.clearAllMocks();

    getPluginConfigMock.mockResolvedValue({
      hasPluginConfigured: true,
      tsConfigFile: 'tsconfig.json',
    });
  });

  it('should display no config error', async () => {
    // given
    getPluginConfigMock.mockResolvedValue({
      hasPluginConfigured: false,
      tsConfigFile: 'tsconfig.json',
    });

    // when
    await run();

    // then
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/isn't configured in/i));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should display no strict files error', async () => {
    // given
    findStrictFilesMock.mockResolvedValue([]);

    // when
    await run();

    // then
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/Project does not contain any strict files/i),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should display a correct number of found strict files and errors', async () => {
    // given
    findStrictFilesMock.mockResolvedValue(['1.ts', '2.ts']);
    findStrictErrorsMock.mockResolvedValue(['error1', 'error2', 'error3']);

    // when
    await run();

    // then
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Found 2 strict files/i));
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/error1/i));
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/error2/i));
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/error3/i));
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Found 3 errors/i));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should display a singular filePath and error', async () => {
    // given
    findStrictFilesMock.mockResolvedValue(['1.ts']);
    findStrictErrorsMock.mockResolvedValue(['error1']);

    // when
    await run();

    // then
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Found 1 strict file/i));
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Found 1 error/i));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should display "all files passed" and should not call process exit 1', async () => {
    // given
    findStrictFilesMock.mockResolvedValue(['1.ts']);
    findStrictErrorsMock.mockResolvedValue([]);

    // when
    await run();

    // then
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('All files passed'));
    expect(process.exit).not.toHaveBeenCalledWith(1);
  });
});
