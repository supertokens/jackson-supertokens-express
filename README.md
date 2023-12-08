# SAML Jackson + SuperTokens Demo App

This demo app shows how to integrate [SAML Jackson](https://github.com/boxyhq/jackson) in a Node + React app that uses SuperTokens for user authentication. Both SAML Jackson and Supertokens are self-hosted but can also work with hosted versions.

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
# start boxyhq with connected to psql db called boxyhq
docker run \
  -p 5225:5225 \
  -e JACKSON_API_KEYS="secret" \
  -e DB_ENGINE="sql" \
  -e DB_TYPE="postgres" \
  -e DB_URL="postgres://<PSQL_USER>:<PSQL_PASSWORD>@<PSQL_HOST>:5432/boxyhq" \
  -d boxyhq/jackson
```

```bash
./addTenant.sh tenant3
```

The above command will generates a client ID and a client secret for tenant3. You should take those values and replace:

```bash
<TODO: GENERATED FROM RUNNING addTenant.sh>
```
in `setup-tenants-supertokens.sh` and then:

```bash
./setup-tenants-supertokens.sh
```

```bash
npm run start
```


## Using [mocksaml.com](https://mocksaml.com/) to quickly test a SAML connection
This demo app uses mocksaml.com as a SAML provider. Open [http://localhost:3000](http://localhost:3000) to see the demo. If you pick `tenant3`, you will see the SAML login button, which will log you in via mocksaml.com

## Manually adding a SAML provider
### Configure SAML Identity Provider
Follow the [doc](https://boxyhq.com/docs/jackson/configure-saml-idp). You will then need to download the SAML metadata file after configuring the SAML app with your Identity Provider. Okta is a good place and offers a free Developer Account. Feel free to contact us if you need any help with this.

### Add SAML Config

Replace `<Metadata>` with the your metadata content.

```bash
curl --location --request POST 'http://localhost:5225/api/v1/saml/config' \
  --header 'Authorization: Api-Key secret' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'rawMetadata= <Metadata>' \
  --data-urlencode 'defaultRedirectUrl=http://localhost:3000' \
  --data-urlencode 'redirectUrl=["http://localhost:3000/*"]' \
  --data-urlencode 'tenant=boxyhq.com' \
  --data-urlencode 'product=supertokens'
```

## Try the Demo
Open [http://localhost:3000](http://localhost:3000) to try the demo. Choose `tenant3` and then click on the button `Continue with SAML Jackson`.

# Demo Information

- The demo app is configured to use the SuperTokens self-hosted instance running with an in memory db `http://localhost:3567`. If you connect an actual Postgres db to SuperTokens, you will have to enable the multi tenancy paid feature for this app to work. You can do this by [signing up on supertokens.com](https://supertokens.com/auth) and getting a license key for yourself.
- The `app` (React): `http://localhost:3000`
- The `api` (Express) server: `http://localhost:3001`
- Jackson self-hosted instance server: `http://localhost:5225`
- Jackson uses `Postgres` as database engine
