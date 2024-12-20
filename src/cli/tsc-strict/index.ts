#!/usr/bin/env node

import chalk from 'chalk';
import { findStrictErrors } from '../findStrictErrors';
import { findStrictFiles } from '../findStrictFiles';
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

  const errors = await findStrictErrors(strictFilePaths);

  errors.forEach((error) => {
    console.log(chalk.red(error));
  });

  if (errors.length > 0) {
    console.log(`💥 Found ${errors.length} ${pluralize('error', errors.length)}`);
    return process.exit(1);
  }

  console.log(`🎉 ${chalk.green('All files passed')}`);
};

run();
