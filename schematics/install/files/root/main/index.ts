import { HttpRequest, InvocationContext } from '@azure/functions';
import { AzureHttpAdapter } from '@edeneuve/azure-func-http';
import { createApp } from '../<%= getRootDirectory() %>/main.azure';

export default function(context: InvocationContext, req: HttpRequest): void {
  AzureHttpAdapter.handle(createApp, context, req);
}
