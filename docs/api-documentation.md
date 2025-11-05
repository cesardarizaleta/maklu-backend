# Documentación API para Frontend Angular - Sistema de Generación de Tesis

## Introducción

Esta documentación describe cómo integrar el frontend en Angular con el backend de NestJS para el sistema de generación automática de tesis. El backend utiliza Gemini AI para generar contenido académico completo, incluyendo preliminares, introducción, metodología, resultados, conclusiones y referencias, siguiendo estándares APA 7.

### Características Principales
- **Autenticación**: API key via Bearer token
- **Respuestas Unificadas**: Todas las respuestas siguen el formato `ApiResponse<T>`
- **Generación Completa**: Tesis de ~50 páginas con manejo automático de límites de cuota
- **Documentación Interactiva**: Swagger disponible en `/api/docs`

## Configuración Inicial

### 1. Instalar Dependencias en Angular
```bash
npm install @angular/common/http rxjs
```

### 2. Configurar HttpClient
En `app.module.ts` o `app.config.ts` (Angular 17+):
```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule],
  // ...
})
export class AppModule {}
```

### 3. Variables de Entorno
Crear `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiKey: 'tu-api-key-aqui' // Obtener del backend
};
```

## Autenticación

El sistema utiliza autenticación por API key. Todas las requests deben incluir el header `Authorization: Bearer <api-key>`.

### Configurar Interceptor Global
Crear `auth.interceptor.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${environment.apiKey}`
      }
    });
    return next.handle(authReq);
  }
}
```

Registrar en `app.module.ts`:
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  // ...
})
export class AppModule {}
```

## Modelos de Datos

### ApiResponse<T>
Todas las respuestas siguen este formato:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### Thesis
```typescript
interface Thesis {
  id: string;
  title: string;
  idea: string;
  discipline?: string;
  status: 'generating' | 'ready' | 'failed';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ThesisPart
```typescript
interface ThesisPart {
  id: string;
  thesisId: string;
  key: string; // ej: 'introduction.problemStatement'
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### CreateThesisDto
```typescript
interface CreateThesisDto {
  idea: string;
  discipline?: string;
}
```

### UpdateThesisPartDto
```typescript
interface UpdateThesisPartDto {
  content: string;
}
```

## Endpoints

### Base URL
```
http://localhost:3000/api
```

### 1. Crear Tesis desde Idea
**POST** `/theses/idea`

Crea una nueva tesis y dispara la generación automática en background.

**Request Body:**
```json
{
  "idea": "Descripción de la idea de tesis",
  "discipline": "Ingeniería" // opcional
}
```

**Response:**
```typescript
ApiResponse<Thesis>
```

**Ejemplo Angular:**
```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThesisService {
  constructor(private http: HttpClient) {}

  createFromIdea(idea: string, discipline?: string): Observable<ApiResponse<Thesis>> {
    return this.http.post<ApiResponse<Thesis>>(`${environment.apiUrl}/theses/idea`, {
      idea,
      discipline
    });
  }
}
```

### 2. Listar Tesis del Usuario
**GET** `/theses`

**Response:**
```typescript
ApiResponse<Thesis[]>
```

**Ejemplo Angular:**
```typescript
getTheses(): Observable<ApiResponse<Thesis[]>> {
  return this.http.get<ApiResponse<Thesis[]>>(`${environment.apiUrl}/theses`);
}
```

### 3. Obtener Árbol de Partes de una Tesis
**GET** `/theses/:id/tree`

Devuelve la estructura jerárquica de partes de la tesis.

**Response:**
```typescript
ApiResponse<{
  thesis: Thesis;
  parts: ThesisPart[];
}>
```

**Ejemplo Angular:**
```typescript
getThesisTree(id: string): Observable<ApiResponse<{ thesis: Thesis; parts: ThesisPart[] }>> {
  return this.http.get<ApiResponse<{ thesis: Thesis; parts: ThesisPart[] }>>(
    `${environment.apiUrl}/theses/${id}/tree`
  );
}
```

### 4. Obtener Tesis Completa
**GET** `/theses/:id/full`

Devuelve la tesis completa con todas las partes en un objeto indexado por key.

**Response:**
```typescript
ApiResponse<{
  thesis: Thesis;
  parts: { [key: string]: ThesisPart };
}>
```

**Ejemplo Angular:**
```typescript
getFullThesis(id: string): Observable<ApiResponse<{ thesis: Thesis; parts: { [key: string]: ThesisPart } }>> {
  return this.http.get<ApiResponse<{ thesis: Thesis; parts: { [key: string]: ThesisPart } }>>(
    `${environment.apiUrl}/theses/${id}/full`
  );
}
```

### 5. Obtener Parte Específica
**GET** `/thesis/:id/:section`

Ejemplos:
- `/thesis/123/introduction` - Toda la introducción
- `/thesis/123/preliminaries` - Todos los preliminares
- `/thesis/123/methodology` - Toda la metodología

**Response:**
```typescript
ApiResponse<ThesisPart[]>
```

**Ejemplo Angular:**
```typescript
getSection(id: string, section: string): Observable<ApiResponse<ThesisPart[]>> {
  return this.http.get<ApiResponse<ThesisPart[]>>(`${environment.apiUrl}/thesis/${id}/${section}`);
}
```

### 6. Actualizar Parte Específica
**PATCH** `/thesis/:id/:section`

Ejemplos:
- `/thesis/123/introduction.problemStatement`
- `/thesis/123/results`

**Request Body:**
```json
{
  "content": "Nuevo contenido..."
}
```

**Response:**
```typescript
ApiResponse<ThesisPart>
```

**Ejemplo Angular:**
```typescript
updatePart(id: string, key: string, content: string): Observable<ApiResponse<ThesisPart>> {
  return this.http.patch<ApiResponse<ThesisPart>>(
    `${environment.apiUrl}/thesis/${id}/${key}`,
    { content }
  );
}
```

## Manejo de Errores

### Respuestas de Error
```typescript
interface ApiResponse<T> {
  success: false;
  message?: string;
  error?: string;
}
```

### Casos Comunes
- **401 Unauthorized**: API key inválida o faltante
- **404 Not Found**: Tesis o parte no existe
- **429 Too Many Requests**: Límite de cuota de Gemini excedido (el backend reintenta automáticamente)
- **500 Internal Server Error**: Error en generación (ver logs del backend)

### Manejo en Angular
```typescript
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

createFromIdea(idea: string, discipline?: string) {
  return this.http.post<ApiResponse<Thesis>>(`${environment.apiUrl}/theses/idea`, {
    idea,
    discipline
  }).pipe(
    catchError(error => {
      console.error('Error creating thesis:', error);
      return throwError(() => error);
    })
  );
}
```

## Estados de Tesis

- **generating**: La tesis se está generando (puede tomar varios minutos)
- **ready**: Generación completada, lista para consultar
- **failed**: Error en generación

### Polling para Estado
```typescript
checkStatus(id: string): Observable<ApiResponse<Thesis>> {
  return this.http.get<ApiResponse<Thesis>>(`${environment.apiUrl}/theses/${id}`);
}

// En componente:
ngOnInit() {
  this.pollStatus();
}

pollStatus() {
  if (this.thesis?.status === 'generating') {
    setTimeout(() => {
      this.thesisService.checkStatus(this.thesisId).subscribe(response => {
        if (response.success) {
          this.thesis = response.data;
          if (this.thesis.status === 'generating') {
            this.pollStatus(); // Continuar polling
          }
        }
      });
    }, 5000); // Poll cada 5 segundos
  }
}
```

## Documentación Interactiva

Accede a Swagger UI en: `http://localhost:3000/api/docs`

Allí encontrarás:
- Descripciones detalladas de cada endpoint
- Modelos de request/response
- Posibilidad de probar los endpoints directamente

## Consideraciones de Producción

- **Rate Limiting**: El backend maneja automáticamente los límites de Gemini con reintentos y backoff
- **Timeouts**: Las generaciones pueden tomar 5-15 minutos; implementar polling o websockets para actualizaciones en tiempo real
- **Caché**: Considera cachear las tesis completas en el frontend para mejor UX
- **Error Handling**: Implementa manejo robusto de errores y estados de carga

## Soporte

Para más detalles técnicos, consulta el código fuente del backend o la documentación de Swagger.