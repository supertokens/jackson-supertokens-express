import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import ThirdParty from "supertokens-auth-react/recipe/thirdparty";
import Passwordless from "supertokens-auth-react/recipe/passwordless";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import Session from "supertokens-auth-react/recipe/session";
import Multitenancy from "supertokens-auth-react/recipe/multitenancy";

export function getApiDomain() {
    const apiPort = process.env.REACT_APP_API_PORT || 3001;
    const apiUrl = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
    return apiUrl;
}

export function getWebsiteDomain() {
    const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3000;
    const websiteUrl = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;
    return websiteUrl;
}

export const styleOverride = `
[data-supertokens~=tenants-link] {
    margin-top: 8px;
}
`;

export const SuperTokensConfig = {
    appInfo: {
        appName: "SuperTokens Demo App",
        apiDomain: getApiDomain(),
        websiteDomain: getWebsiteDomain(),
    },
    usesDynamicLoginMethods: true,
    style: styleOverride,
    // recipeList contains all the modules that you want to
    // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
    recipeList: [
        EmailPassword.init(),
        Passwordless.init({
            contactMethod: "EMAIL",
        }),
        ThirdParty.init(),
        Session.init({
            onHandleEvent: (event) => {
                // This is done to remove the saved tenantId so that when the user next
                // visits the login page, they see the tenant drop down.
                if (["SIGN_OUT", "UNAUTHORISED", "SESSION_CREATED"].includes(event.action)) {
                    localStorage.removeItem("tenantId");
                }
            },
        }),
        Multitenancy.init({
            override: {
                functions: (oI) => {
                    return {
                        ...oI,
                        getTenantId: async () => {
                            const tenantIdInStorage = localStorage.getItem("tenantId");
                            return tenantIdInStorage === null ? undefined : tenantIdInStorage;
                        },
                    };
                },
            },
        }),
    ],
};

export const recipeDetails = {
    docsLink: "https://supertokens.com/docs/multitenancy/introduction",
};

export const PreBuiltUIList = [ThirdPartyPreBuiltUI, EmailPasswordPreBuiltUI, PasswordlessPreBuiltUI];
