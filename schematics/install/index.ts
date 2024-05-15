import { strings } from '@angular-devkit/core';
import { parse as parseJson } from 'jsonc-parser';
import {
  apply,
  chain,
  FileEntry,
  forEach,
  mergeWith,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependencyType,
  removePackageJsonDependency
} from '@schematics/angular/utility/dependencies';
import { Schema as AzureOptions } from './schema';

type UpdateJsonFn<T> = (obj: T) => T | void;

const addPackagesList = [
  {
    type: NodeDependencyType.Default,
    name: '@azure/functions',
    version: '^4.4.0',
    overwrite: true
  },
  {
    type: NodeDependencyType.Dev,
    name: 'azure-functions-core-tools',
    version: '^4.x',
    overwrite: true
  },
  {
    type: NodeDependencyType.Dev,
    name: '@types/node',
    version: '18.x',
    overwrite: true
  },
  {
    type: NodeDependencyType.Dev,
    name: 'typescript',
    version: '^4.0.0',
    overwrite: true
  },
  {
    type: NodeDependencyType.Dev,
    name: 'rimraf',
    version: '^5.0.0',
    overwrite: true
  }
];
const removePackageList = ['@azure/functions', '@nestjs/azure-func-http'];

function migrateFromNestJsAzureFuncHttp(): Rule {
  return (host: Tree) => {
    const oldFile = ['./main/index.ts', './src/main.azure.ts'];
    oldFile.forEach((file) => {
      if (host.exists(file)) {
        host.delete(file);
      }
    });

    return host;
  };
}

function addDependenciesAndScripts(): Rule {
  return (host: Tree) => {
    removePackageList.forEach((delPackage) =>
      removePackageJsonDependency(host, delPackage)
    );
    addPackagesList.forEach((iPackage) =>
      addPackageJsonDependency(host, iPackage)
    );
    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);
    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    const pkg = JSON.parse(buffer.toString());
    pkg.scripts['start:azure'] = 'npm run build && func host start';
    pkg['main'] = './dist/main/index.js';

    host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
    return host;
  };
}

function removeProxiesFiles(): Rule {
  return (host: Tree) => {
    if (host.exists('/proxies.json')) {
      host.delete('/proxies.json');
    }
  };
}

function updateJsonFile<T>(
  host: Tree,
  path: string,
  callback: UpdateJsonFn<T>
): Tree {
  const source = host.read(path);
  if (source) {
    const sourceText = source.toString('utf-8');
    const json = parseJson(sourceText);
    callback(json as {} as T);
    host.overwrite(path, JSON.stringify(json, null, 2));
  }
  return host;
}
const applyProjectName = (projectName, host) => {
  if (projectName) {
    const nestCliFileExists = host.exists('nest-cli.json');

    if (nestCliFileExists) {
      updateJsonFile(
        host,
        'nest-cli.json',
        (optionsFile: Record<string, any>) => {
          if (optionsFile.projects[projectName].compilerOptions) {
            optionsFile.projects[projectName].compilerOptions = {
              ...optionsFile.projects[projectName].compilerOptions,
              ...{
                webpack: true,
                webpackConfigPath: `${projectName}/webpack.config.js`
              }
            };
          }
        }
      );
    }
  }
};

const rootFiles = ['/.funcignore', '/host.json', '/local.settings.json'];

const validateExistingRootFiles = (host: Tree, file: FileEntry) => {
  return rootFiles.includes(file.path) && host.exists(file.path);
};

export default function (options: AzureOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }
    const defaultSourceRoot =
      options.project !== undefined ? options.sourceRoot : options.rootDir;
    const rootSource = apply(
      options.project ? url('./files/project') : url('./files/root'),
      [
        template({
          ...strings,
          ...options,
          rootDir: options.rootDir,
          sourceRoot: defaultSourceRoot,
          getRootDirectory: () => options.rootDir,
          getProjectName: () => options.project,
          stripTsExtension: (s: string) => s.replace(/\.ts$/, ''),
          getRootModuleName: () => options.rootModuleClassName,
          getRootModulePath: () => options.rootModuleFileName
        }),
        forEach((file: FileEntry) => {
          if (validateExistingRootFiles(host, file)) return null;
          return file;
        })
      ]
    );

    return chain([
      (tree, context) =>
        options.project
          ? applyProjectName(options.project, host)
          : noop()(tree, context),
      migrateFromNestJsAzureFuncHttp(),
      addDependenciesAndScripts(),
      removeProxiesFiles(),
      mergeWith(rootSource)
    ]);
  };
}
