import { HttpRequest, InvocationContext } from '@azure/functions';
import { AzureHttpAdapter } from '@edeneuve/nestjs-azure-func-http';
import { createApp } from '../<%= getRootDirectory() %>/main.azure';

export default function(context: Context, req: HttpRequest): void {
  AzureHttpAdapter.handle(createApp, context, req);
}
