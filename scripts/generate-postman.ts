import * as fs from 'fs';
import * as path from 'path';
import { Project, Node, SyntaxKind, Decorator, CallExpression, StringLiteral, ObjectLiteralExpression, PropertyAssignment } from 'ts-morph';

interface PostmanRequest {
  name: string;
  request: {
    method: string;
    header: any[];
    body?: any;
    url: string;
  };
  response: any[];
}

interface PostmanFolder {
  name: string;
  item: PostmanRequest[];
}

interface PostmanCollection {
  info: {
    _postman_id: string;
    name: string;
    description: string;
    schema: string;
    _exporter_id: string;
  };
  item: PostmanFolder[];
  variable: any[];
}

function extractStringFromDecorator(decorator: Decorator): string | null {
  const callExpression = decorator.getFirstDescendantByKind(SyntaxKind.CallExpression);
  if (!callExpression) return null;

  const args = callExpression.getArguments();
  if (args.length === 0) return null;

  const firstArg = args[0];
  if (Node.isStringLiteral(firstArg)) {
    return firstArg.getLiteralValue();
  }

  return null;
}

function extractApiOperation(decorator: Decorator): string | null {
  const callExpression = decorator.getFirstDescendantByKind(SyntaxKind.CallExpression);
  if (!callExpression) return null;

  const args = callExpression.getArguments();
  if (args.length === 0) return null;

  const firstArg = args[0];
  if (Node.isObjectLiteralExpression(firstArg)) {
    const summaryProp = firstArg.getProperty('summary');
    if (Node.isPropertyAssignment(summaryProp)) {
      const initializer = summaryProp.getInitializer();
      if (Node.isStringLiteral(initializer)) {
        return initializer.getLiteralValue();
      }
    }
  }

  return null;
}

function analyzeController(filePath: string): PostmanFolder | null {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  const classDeclaration = sourceFile.getClasses()[0];
  if (!classDeclaration) return null;

  const controllerDecorator = classDeclaration.getDecorator('Controller');
  if (!controllerDecorator) return null;

  const basePath = extractStringFromDecorator(controllerDecorator) || '';

  const requests: PostmanRequest[] = [];

  classDeclaration.getMethods().forEach(method => {
    const httpMethod = ['Get', 'Post', 'Put', 'Delete', 'Patch'].find(m =>
      method.getDecorator(m) !== undefined
    );

    if (!httpMethod) return;

    const routeDecorator = method.getDecorator(httpMethod);
    if (!routeDecorator) return;

    const routePath = extractStringFromDecorator(routeDecorator) || '';

    const apiOperationDecorator = method.getDecorator('ApiOperation');
    const name = (apiOperationDecorator ? extractApiOperation(apiOperationDecorator) : null) || `${httpMethod} ${routePath}`;

    const fullUrl = `{{base_url}}/${basePath}/${routePath}`.replace(/\/+/g, '/');

    const headers: any[] = [
      {
        key: 'Authorization',
        value: 'Bearer {{apiKey}}'
      }
    ];

    let body: any = undefined;
    if (httpMethod === 'Post' || httpMethod === 'Put' || httpMethod === 'Patch') {
      headers.push({
        key: 'Content-Type',
        value: 'application/json'
      });
      body = {
        mode: 'raw',
        raw: '{}'
      };
    }

    requests.push({
      name,
      request: {
        method: httpMethod.toUpperCase(),
        header: headers,
        body,
        url: fullUrl
      },
      response: []
    });
  });

  if (requests.length === 0) return null;

  const className = classDeclaration.getName() || 'Unknown';
  return {
    name: className.replace('Controller', ''),
    item: requests
  };
}

function generatePostmanCollection(): PostmanCollection {
  const controllerFiles = [
    'src/auth/auth.controller.ts',
    'src/theses/theses.controller.ts',
    'src/thesis/introduction/introduction.controller.ts',
    'src/thesis/chapters/chapters.controller.ts',
    'src/thesis/methodology/methodology.controller.ts',
    'src/thesis/results/results.controller.ts',
    'src/thesis/conclusions/conclusions.controller.ts',
    'src/thesis/references/references.controller.ts',
    'src/thesis/appendices/appendices.controller.ts',
    'src/thesis/preliminaries/preliminaries.controller.ts'
  ];

  const folders: PostmanFolder[] = [];

  controllerFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      const folder = analyzeController(fullPath);
      if (folder) {
        folders.push(folder);
      }
    }
  });

  // Add App controller manually
  folders.push({
    name: 'App',
    item: [
      {
        name: 'Health Check',
        request: {
          method: 'GET',
          header: [],
          url: '{{base_url}}/'
        },
        response: []
      }
    ]
  });

  return {
    info: {
      _postman_id: 'maklu-backend-collection',
      name: 'Maklu Backend API',
      description: 'Colección completa de endpoints para la API de Maklu Backend - Generación de Tesis',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      _exporter_id: 'maklu-backend'
    },
    item: folders,
    variable: [
      {
        key: 'base_url',
        value: 'http://localhost:3000',
        type: 'string'
      },
      {
        key: 'apiKey',
        value: '',
        type: 'string'
      },
      {
        key: 'thesisId',
        value: '',
        type: 'string'
      }
    ]
  };
}

const collection = generatePostmanCollection();
const outputPath: string = path.join(__dirname, '..', 'maklu-backend.postman_collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
console.log(`Postman collection generated at: ${outputPath}`);