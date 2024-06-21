<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">

## Description

[Azure Functions](https://code.visualstudio.com/tutorials/functions-extension/getting-started) HTTP module for [Nest](https://github.com/nestjs/nest) fixed for Azure Function 4.

## Installation

Using the Nest CLI:

```bash
npm install @simplifi-ed/azure-func-http
nest add @simplifi-ed/azure-func-http
```

Example output:

```bash
✔ Installation in progress... ☕
✔ Package installation in progress... ☕
Starting library setup...
CREATE local.settings.json (172 bytes)
CREATE main/function.json (294 bytes)
CREATE main/index.ts (309 bytes)
CREATE main/sample.dat (23 bytes)
CREATE src/main.azure.ts (321 bytes)
UPDATE package.json (3101 bytes)
✔ Packages installed successfully.
```

## Native routing

If you don't need the compatibility with `express` library, you can use a native routing instead:

```typescript
const app = await NestFactory.create(AppModule, new AzureHttpRouter());
```

`AzureHttpRouter` is exported from `@nestjs/azure-func-http`. Since `AzureHttpRouter` doesn't use `express` underneath, the routing itself is much faster.

## Additional options

You can pass additional flags to customize the post-install schematic. For example, if your base application directory is different than `src`, use `--rootDir` flag:

```bash
npm install @simplifi-ed/azure-func-http
nest add @simplifi-ed/azure-func-http --rootDir app
```

Other available flags:

- `rootModuleFileName` - the name of the root module file, default: `app.module`
- `rootModuleClassName` - the name of the root module class, default: `AppModule`
- `skipInstall` - skip installing dependencies, default: `false`

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
