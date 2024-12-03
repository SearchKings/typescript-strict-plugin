import { Config } from './types';
import { isFileStrictByPath } from './isFileStrictByPath';
import { TS_STRICT_COMMENT, TS_STRICT_IGNORE_COMMENT } from './constants';
import { isFileExcludedByPath } from './isFileExcludedByPath';
import { isFileExcludedByPattern } from './isFileExcludedByPattern';

type IsFileStrictConfig = {
  filePath: string;
  projectPath?: string;
  config?: Config;
  isCommentPresent: (comment: string, filePath: string) => boolean;
};

// Common logic determining whether file is strict or not
export function isFileStrict({
  filePath,
  config,
  projectPath,
  isCommentPresent,
}: IsFileStrictConfig): boolean {
  const configPaths = config?.paths ?? [];
  const configExclude = config?.exclude ?? [];
  const configExcludePattern = config?.excludePattern ?? [];
  const isIgnoreCommentPresent = isCommentPresent(TS_STRICT_IGNORE_COMMENT, filePath);
  const isStrictCommentPresent = isCommentPresent(TS_STRICT_COMMENT, filePath);

  if (isIgnoreCommentPresent) {
    return false;
  }

  if (isStrictCommentPresent) {
    return true;
  }

  if (
    isFileExcludedByPath({
      filePath,
      configExclude,
      projectPath,
    }) ||
    isFileExcludedByPattern({
      filePath,
      configExcludePattern,
    })
  ) {
    return false;
  }

  const fileStrictByPath = isFileStrictByPath({ filePath, configPaths, projectPath });

  if (configPaths.length && !fileStrictByPath) {
    return false;
  }

  return true;
}
