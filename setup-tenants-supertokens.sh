curl --location --request POST 'http://localhost:3567/recipe/dashboard/user' \
--header 'rid: dashboard' \
--header 'api-key: <YOUR-API-KEY>' \
--header 'Content-Type: application/json' \
--data-raw '{"email": "demo@supertokens.com","password": "abcd1234"}'

curl --location --request PUT 'http://localhost:3567/recipe/multitenancy/tenant' \
--header 'Content-Type: application/json' \
--data-raw '{
    "tenantId": "tenant1",
    "emailPasswordEnabled": true,
    "thirdPartyEnabled": true,
    "passwordlessEnabled": false
}'

curl --location --request PUT 'http://localhost:3567/tenant1/recipe/multitenancy/config/thirdparty' \
--header 'Content-Type: application/json' \
--data-raw '{
  "config": {
    "thirdPartyId": "google-workspaces",
    "name": "Google Workspaces",
    "clients": [
      {
        "clientId": "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
        "clientSecret": "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",
        "additionalConfig": {
            "hd": "*"
        }
      }
    ]
  }
}'


curl --location --request PUT 'http://localhost:3567/recipe/multitenancy/tenant' \
--header 'Content-Type: application/json' \
--data-raw '{
    "tenantId": "tenant2",
    "emailPasswordEnabled": true,
    "thirdPartyEnabled": false,
    "passwordlessEnabled": false
}'

curl --location --request PUT 'http://localhost:3567/recipe/multitenancy/tenant' \
--header 'Content-Type: application/json' \
--data-raw '{
    "tenantId": "tenant3",
    "emailPasswordEnabled": false,
    "thirdPartyEnabled": true,
    "passwordlessEnabled": true
}'


curl --location --request PUT 'http://localhost:3567/tenant3/recipe/multitenancy/config/thirdparty' \
--header 'Content-Type: application/json' \
--data-raw '{
  "config": {
    "thirdPartyId": "github",
    "name": "GitHub",
    "clients": [
      {
        "clientId": "467101b197249757c71f",
        "clientSecret": "e97051221f4b6426e8fe8d51486396703012f5bd"
      }
    ]
  }
}'

curl --location --request PUT 'http://localhost:3567/tenant3/recipe/multitenancy/config/thirdparty' \
--header 'api-key: <API_KEY(if configured)>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "config": {
    "thirdPartyId": "boxy-saml",
    "name": "SAML Login",
    "clients": [
      {
        "clientId": "<TODO: GENERATED FROM RUNNING addTenant.sh>",
        "clientSecret": "<TODO: GENERATED FROM RUNNING addTenant.sh>",
        "additionalConfig": {
          "boxyURL": "http://localhost:5225"
        }
      }
    ]
  }
}'

curl --location --request PUT 'http://localhost:3567/tenant3/recipe/multitenancy/config/thirdparty' \
--header 'api-key: <API_KEY(if configured)>' \
--header 'Content-Type: application/json' \
--data-raw '{
  "config": {
    "thirdPartyId": "boxy-saml-google-workspaces",
    "name": "Google workspaces",
    "clients": [
      {
        "clientId": "<TODO: GENERATED FROM RUNNING addOIDCTenantToBoxy>",
        "clientSecret": "<TODO: GENERATED FROM RUNNING addOIDCTenantToBoxy>",
        "additionalConfig": {
          "boxyURL": "http://localhost:5225"
        }
      }
    ]
  }
}'