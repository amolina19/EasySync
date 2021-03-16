

use admin
db.createUser(
  {
    user: 'admin',
    pwd: passwordPrompt(),
    roles: [ { role: 'root', db: 'admin' } ]
  }
);


use admin
switched to db admin
> db.auth("lolm3",passwordPrompt())

use admin;
db.grantRolesToUser('admin', [{ role: 'root', db: 'admin' }])