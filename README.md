# SAML Jackson + SuperTokens Demo App + SCIM (Directory sync)

This demo app shows how to integrate [SAML Jackson](https://github.com/boxyhq/jackson) in a Node + React app that uses [SuperTokens](https://supertokens.com) for user authentication. Both SAML Jackson and Supertokens are self-hosted but can also work with hosted versions.

## Setup

```bash
git clone https://github.com/boxyhq/jackson-supertokens-express.git
```

```bash
cd jackson-supertokens-express
```

```bash
cd frontend && npm i
```

```bash
cd backend && npm i
```

```bash
# start supertokens with in memory db
docker run -p 3567:3567 -d registry.supertokens.io/supertokens/supertokens-postgresql
```

```bash
# start boxyhq with in memory db
docker run \
  -p 5225:5225 \
  -e JACKSON_API_KEYS="secret" \
  -e DB_ENGINE="mem" \
  -e NEXTAUTH_SECRET="super-secret" \
  -e NEXTAUTH_ADMIN_CREDENTIALS="admin@company.com:secretpassword" \
  -d boxyhq/jackson
```

```bash
./addTenant.sh tenant3
```

The above command will add a new SAML provider to `tenant3` and will generate a client ID and a client secret for this provider and tenant. This will then be used by SuperTokens to login via this SAML provider. You should take the generated client ID and secret and replace the below string with them:

```bash
<TODO: GENERATED FROM RUNNING addTenant.sh>
```
in `setup-tenants-supertokens.sh`.

```bash
./setup-tenants-supertokens.sh
```

```bash
npm run start
```


## Using [mocksaml.com](https://mocksaml.com/) to quickly test a SAML connection
This demo app uses mocksaml.com as a SAML provider. Open [http://localhost:3000](http://localhost:3000) to see the demo. If you pick `tenant3`, you will see the SAML login button, which will log you in via mocksaml.com

## Manually adding a SAML provider
### 1) Configure SAML Identity Provider
Follow the [doc](https://boxyhq.com/docs/jackson/configure-saml-idp). You will then need to download the SAML metadata file after configuring the SAML app with your Identity Provider. Okta is a good place and offers a free Developer Account. Feel free to contact us if you need any help with this.

### 2) Add the SAML provider as a login method in SuperTokens

Refer to [our docs on supertokens.com](https://supertokens.com/docs/thirdpartyemailpassword/common-customizations/saml/with-boxyhq/integration-steps) to see how to configure and add your SAML connections.

## Testing SCIM (Directory sync)
In this demo app, we have added directory sync with Google Workspaces. In order to set that up, you need to start boxyhq with the following additional env vars:

```
DSYNC_GOOGLE_CLIENT_ID=
DSYNC_GOOGLE_CLIENT_SECRET=
DSYNC_GOOGLE_REDIRECT_URI=http://localhost:5225/api/scim/oauth/callback
```
- To generate a `DSYNC_GOOGLE_CLIENT_ID` and `DSYNC_GOOGLE_CLIENT_SECRET`, follow [this guide](https://boxyhq.com/docs/directory-sync/providers/google).
- Make sure to set the value of `DSYNC_GOOGLE_REDIRECT_URI` to point to your boxyHQ instance instead of `localhost:5225` if needed.

Once you have done the above, navigate to the [BoxyHQ admin portal](http://localhost:5225), and click on Directory Sync -> Connections section. There, create a new directory for Google:
- Directory Name: Google Workspaces (this can be anything)
- Directory Provider: Google
- Directory Domain: (Leave this empty)
- Tenant: `tenant3` (we use this in our example - it corresponds to `tenant3` in SuperTokens)
- Product: `supertokens`
- Webhook URL: `http://localhost:3001/scim` (This is an API we have created in `backend/index.ts`)
- Webhook secret: `abcd1234` (We will use this for webhook authentication)

Once created, you will see a URL at the bottom of the screen: `http://localhost:5225/api/scim/oauth/authorize?directoryId=...` you need to navigate to that on your browser and login as the admin of your Google workspaces account. This will generate an access and refresh token which can then be used by BoxyHQ to sync users from Google Workspaces.

To initiate a sync, send a `GET` request to `http://localhost:5225/api/v1/dsync/cron/sync-google`. This will sync all users from Google Workspaces to BoxyHQ, and in turn BoxyHQ will call our node webhook (`http://localhost:3001/scim`) with the [relevant events](https://boxyhq.com/docs/directory-sync/events) which we can use to create users in SuperTokens.

## Try the Demo
Open [http://localhost:3000](http://localhost:3000) to try the demo. Choose `tenant3` and then click on the button `Continue with SAML Jackson`.

# Demo Information

- The demo app is configured to use the SuperTokens self-hosted instance running with an in memory db `http://localhost:3567`. If you connect an actual Postgres db to SuperTokens, you will have to enable the multi tenancy paid feature for this app to work. You can do this by [signing up on supertokens.com](https://supertokens.com/auth) and getting a license key for yourself.
- The `app` (React): `http://localhost:3000`
- The `api` (Express) server: `http://localhost:3001`
- Jackson self-hosted instance server: `http://localhost:5225`
- Jackson uses `Postgres` as database engine
