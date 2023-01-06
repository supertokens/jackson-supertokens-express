import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SuperTokens, {
  getSuperTokensRoutesForReactRouterDom,
  SuperTokensWrapper,
} from "supertokens-auth-react";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import ThirdPartyEmailPassword, {
  ThirdpartyEmailPasswordComponentsOverrideProvider,
} from "supertokens-auth-react/recipe/thirdpartyemailpassword";
import "./App.css";
import Footer from "./Footer";
import Home from "./Home";
import SessionExpiredPopup from "./SessionExpiredPopup";

export function getApiDomain() {
  const apiPort = process.env.REACT_APP_API_PORT || 4000;
  const apiUrl = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
  return apiUrl;
}

export function getWebsiteDomain() {
  const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3366;
  const websiteUrl =
    process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;
  return websiteUrl;
}

SuperTokens.init({
  appInfo: {
    appName: 'Jackson',
    apiDomain: getApiDomain(),
    websiteDomain: getWebsiteDomain(),
  },
  recipeList: [
    ThirdPartyEmailPassword.init({
      preAPIHook: async (context) => {
        let url = new URL(context.url);
        let action = context.action;

        if (action === "GET_AUTHORISATION_URL") {
          let tenantId = document
            .querySelector("#supertokens-root")
            .shadowRoot.getElementById("saml-tenant").value;
          localStorage.setItem("saml-tenant-id", tenantId);
          url.searchParams.append("tenant", tenantId);
          url.searchParams.append("product", "supertokens");
        }

        if (action === 'THIRD_PARTY_SIGN_IN_UP') {
          let tenantId = localStorage.getItem("saml-tenant-id");
          url.searchParams.append('tenant', tenantId);
          url.searchParams.append('product', 'supertokens');
        }

        return {
          requestInit: context.requestInit,
          url: url.href,
        };
      },

      signInAndUpFeature: {
        providers: [
          {
            id: 'saml-jackson',
            name: 'SAML Jackson',
          },
        ],
      },
    }),
    Session.init(),
  ],
});

function App() {
  let [showSessionExpiredPopup, updateShowSessionExpiredPopup] =
    useState(false);

  return (
    <SuperTokensWrapper>
      <ThirdpartyEmailPasswordComponentsOverrideProvider
        components={{
          ThirdPartySignInAndUpProvidersForm_Override: ({
            DefaultComponent,
            ...props
          }) => {
            return (
              <div>
                <label>
                  {"Tenant ID: "}
                  <input
                    id="saml-tenant"
                    type="text"
                    name="tenant"
                    defaultValue={"app1.com"}
                  />
                </label>
                <DefaultComponent {...props} />
              </div>
            );
          },
        }}
      >
        <div className="App">
          <Router>
            <div className="fill">
              <Routes>
                {/* This shows the login UI on "/auth" route */}
                {getSuperTokensRoutesForReactRouterDom(
                  require("react-router-dom")
                )}

                <Route
                  path="/"
                  element={
                    /* This protects the "/" route so that it shows
                  <Home /> only if the user is logged in.
                  Else it redirects the user to "/auth" */
                    <SessionAuth
                      onSessionExpired={() => {
                        updateShowSessionExpiredPopup(true);
                      }}
                    >
                      <Home />
                      {showSessionExpiredPopup && <SessionExpiredPopup />}
                    </SessionAuth>
                  }
                />
              </Routes>
            </div>
            <Footer />
          </Router>
        </div>
      </ThirdpartyEmailPasswordComponentsOverrideProvider>
    </SuperTokensWrapper>
  );
}

export default App;
