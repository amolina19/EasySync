# API BUILDING ON easysync.es
API and Website Works different Servers. 
The API works with the api subdomain like api.easysync.es on SSL Mode. The API do authentication, remove, delete Users and Files with roles and tokens.

Read all API Uses on https://api.easysync.es/documentation

# Routes POST

    api.easysync.es/users/register to create new user on Login.
    api.easysync.es/users/authenticate to auth user.
    
# Routes DELETE
    api.easysync.es/users/delete/UserID to delete user, need roles.