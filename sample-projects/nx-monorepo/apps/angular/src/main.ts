import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { boo2 } from './test';

console.log(boo2);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
