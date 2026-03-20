import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import serverlessHttp from "serverless-http";

let cachedServer: any;

export const handler = async(event:any, context:any) => {
    if(!cachedServer){
        const nestApp = await NestFactory.create(AppModule);
        await nestApp.init();

        const expressApp = nestApp.getHttpAdapter().getInstance();
        cachedServer = serverlessHttp(expressApp);
    }

    event.path = event.path || '/';
    event.requestPath = event.requestPath || event.path;

    return cachedServer(event, context);
}