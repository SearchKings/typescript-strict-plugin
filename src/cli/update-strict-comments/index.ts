#!/usr/bin/env node

import { findStrictFiles } from '../findStrictFiles';
import chalk from 'chalk';
import { updateStrictComments } from './updateStrictComments';
import { waitWithSpinner } from '../waitWithSpinner';
import { noStrictFilesError, notConfiguredError } from '../errorMessages';
import { pluralize } from '../../common/utils';
import { getPluginConfig } from '../getPluginConfig';

export const run = async () => {
  const pluginConfig = await getPluginConfig();

  if (!pluginConfig?.hasPluginConfigured) {
    console.log(chalk.red(notConfiguredError(pluginConfig?.tsConfigFile)));
    return process.exit(1);
  }

  const strictFilePaths = await waitWithSpinner(findStrictFiles, 'Looking for strict files...');

  if (!strictFilePaths.length) {
    console.log(chalk.red(noStrictFilesError));
    return process.exit(1);
  }

  console.log(
    `🎯 Found ${strictFilePaths.length} strict ${pluralize('file', strictFilePaths.length)}`,
  );

  const { updatedFileCount } = await updateStrictComments(strictFilePaths, pluginConfig.paths);

  console.log(
    `🔧 Updated comments in ${updatedFileCount} ${pluralize('file', strictFilePaths.length)}`,
  );
};

run();
