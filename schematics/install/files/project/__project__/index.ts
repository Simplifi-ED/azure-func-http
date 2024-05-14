import { HttpRequest, InvocationContext } from '@azure/functions';
import { AzureHttpAdapter } from '@edeneuve/nestjs-azure-func-http';
import { createApp } from '../apps/<%= getProjectName() %>/src/main.azure';

export default function(context: InvocationContext, req: HttpRequest): void {
  AzureHttpAdapter.handle(createApp, context, req);
}
