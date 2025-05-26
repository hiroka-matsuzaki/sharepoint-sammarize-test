import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { get_accessToken } from "../utils/graphAuth";

export async function smatsuTestFunc(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    const token = await get_accessToken()

    return { body: `Hello, ${token}!` };
};

app.http('smatsuTestFunc', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: smatsuTestFunc
});
