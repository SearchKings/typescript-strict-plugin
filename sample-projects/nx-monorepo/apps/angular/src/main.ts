import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { boo2 } from './test';
import { booAbc } from './test-2';

// This should error because it is possible undefined
console.log(boo2);

// This line is intentionally ignored by strict type-checking rules - "@ts-strict-ignore"
console.log(booAbc);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
