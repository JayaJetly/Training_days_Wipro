import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function decycle(obj: any): any {
  console.log('decycle: Starting with object:', obj); // Added log
  const idMap = new Map<string, any>();

  // First pass: find all objects with an '$id' and store them in the map.
  function findIds(current: any) {
    console.log('findIds: Processing:', current); // Added log
    if (!current || typeof current !== 'object') {
      return;
    }

    if (current.$id) {
      idMap.set(current.$id, current);
      console.log('findIds: Stored $id:', current.$id, 'Object:', current); // Added log
      // Don't delete $id yet, it might be needed for nested references
    }

    if (Array.isArray(current)) {
      for (const item of current) {
        findIds(item);
      }
    } else if (current.$values && Array.isArray(current.$values)) {
      // Handle collections serialized with reference handling
      for (const item of current.$values) {
        findIds(item);
      }
    } else {
      for (const key in current) {
        if (current.hasOwnProperty(key)) {
          findIds(current[key]);
        }
      }
    }
  }

  // Second pass: replace all '$ref' objects with the actual objects from the map.
  function resolveRefs(current: any): any {
    console.log('resolveRefs: Processing:', current); // Added log
    if (!current || typeof current !== 'object') {
      return current;
    }

    // Is this a reference object?
    if (current.$ref) {
      const resolved = idMap.get(current.$ref);
      console.log('resolveRefs: Found $ref:', current.$ref, 'Resolved:', resolved); // Added log
      if (resolved) {
        return resolved;
      }
      return current; // Return as-is if ref not found
    }

    // Is this a collection that was serialized with reference handling?
    if (current.$values && Array.isArray(current.$values)) {
        const newArr = current.$values.map((item: any) => resolveRefs(item));
        // To avoid circular issues, we replace the original object's properties
        // instead of returning a new one, especially if it has an $id.
        const original = idMap.get(current.$id);
        console.log('resolveRefs: Processing $values. Original:', original); // Added log
        if (original) {
            original.splice(0, original.length, ...newArr);
            delete original.$values;
            delete original.$id;
            return original;
        }
        return newArr;
    }


    if (Array.isArray(current)) {
      return current.map((item: any) => resolveRefs(item)); // Fixed item type here too
    }

    for (const key in current) {
      if (current.hasOwnProperty(key)) {
        current[key] = resolveRefs(current[key]);
      }
    }
    
    // Clean up the $id property after all references are resolved
    if (current.$id) {
        delete current.$id;
    }

    return current;
  }

  findIds(obj);
  console.log('decycle: idMap after findIds:', idMap); // Added log
  const result = resolveRefs(obj);
  console.log('decycle: Result after resolveRefs:', result); // Added log
  return result;
}

@Injectable()
export class JsonDecycleInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Only intercept JSON responses
    if (req.responseType !== 'json') {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      map(event => {
        if (event instanceof HttpResponse && event.body) {
          // Clone the response and decycle the body
          return event.clone({
            body: decycle(event.body),
          });
        }
        return event;
      })
    );
  }
}
