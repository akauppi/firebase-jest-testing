import { initializeApp } from 'firebase-admin/app'    // "modular API" (10.x)
import { projectId } from './config.js'
import { afterAll } from '@jest/globals'


const adminApp = (_ => {
  const app = initializeApp({
    projectId,
    storageBucket: 'demo-1.appspot.com',
  }, `unlimited-${ Date.now() }`);   // unique name keeps away from other "apps" (configurations, really); btw. would be nice if Firebase APIs had nameless "apps" easier.

  afterAll( async () => {   // clean up, automatically
    await adminApp.delete();
  });

  return app;
})();

export {
  adminApp,
}
