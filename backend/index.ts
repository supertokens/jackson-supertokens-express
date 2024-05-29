import express from "express";
import cors from "cors";
import supertokens from "supertokens-node";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { middleware, errorHandler, SessionRequest } from "supertokens-node/framework/express";
import { getWebsiteDomain, SuperTokensConfig } from "./config";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import axios from "axios";
import { manuallyCreateOrUpdateUser } from "supertokens-node/recipe/thirdparty";
import crypto from "crypto"

supertokens.init(SuperTokensConfig);

const app = express();
app.use(express.json());

app.use(
    cors({
        origin: getWebsiteDomain(),
        allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
        methods: ["GET", "PUT", "POST", "DELETE"],
        credentials: true,
    })
);

// This exposes all the APIs from SuperTokens to the client.
app.use(middleware());

// An example API that requires session verification
app.get("/sessioninfo", verifySession(), async (req: SessionRequest, res) => {
    let session = req.session;
    res.send({
        sessionHandle: session!.getHandle(),
        userId: session!.getUserId(),
        accessTokenPayload: session!.getAccessTokenPayload(),
    });
});

// This API is used by the frontend to create the tenants drop down when the app loads.
// Depending on your UX, you can remove this API.
app.get("/tenants", async (req, res) => {
    let tenants = await Multitenancy.listAllTenants();
    res.send(tenants);
});

app.post("/scim", async (req, res, next) => {
    try {
        const secret = 'abcd1234';

        // The signature header from the webhook request.
        const signatureHeader = req.headers["boxyhq-signature"];

        if (typeof signatureHeader !== 'string') {
            throw new Error("Missing signature header");
        }

        // JSON body from the webhook request.
        const body = req.body;

        const [t, s] = signatureHeader.split(',');

        const timestamp = t.split('=')[1];
        const signature = s.split('=')[1];

        const signedPayload = `${timestamp}.${JSON.stringify(body)}`;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(signedPayload)
            .digest('hex');

        // Compare the expectedSignature to the signature
        if (signature !== expectedSignature) {
            throw new Error("Bad request signature")
        }
        let payload = req.body;
        let tenant = payload.tenant;
        let directoryId = payload.directory_id;
        let thirdPartyId: string | undefined = undefined;
        const response = await axios.get(`http://localhost:5225/api/v1/directory-sync?tenant=${tenant}&product=supertokens`, {
            headers: {
                'Authorization': 'Api-Key secret',
                'Content-Type': 'application/json',
            },
        });
        let respData = response.data.data;
        for (let i = 0; i < respData.length; i++) {
            let currDir = respData[i];
            if (currDir.id === directoryId) {
                if (currDir.type === "google") {
                    thirdPartyId = "google-workspaces";
                }
            }
        }
        if (thirdPartyId === undefined) {
            throw new Error("Unknown third party ID");
        }

        if (payload.event === "user.created") {
            let email = payload.data.email;
            let thirdPartyUserId = payload.data.id;
            await manuallyCreateOrUpdateUser(tenant, thirdPartyId, thirdPartyUserId, email, true);
        } else if (payload.event === "user.deleted") {
            let thirdPartyUserId = payload.data.id;
            let user = await supertokens.listUsersByAccountInfo(tenant, {
                thirdParty: {
                    id: thirdPartyId,
                    userId: thirdPartyUserId,
                }
            });
            if (user !== undefined) {
                await supertokens.deleteUser(user[0].id);
            }
        }
        res.send("Success");
    } catch (err) {
        next(err);
    }
})

// In case of session related errors, this error handler
// returns 401 to the client.
app.use(errorHandler());

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(err)
    res.status(500).send("Internal Error");
});

app.listen(3001, () => console.log(`API Server listening on port 3001`));
