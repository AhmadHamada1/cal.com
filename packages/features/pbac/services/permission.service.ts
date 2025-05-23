import { PermissionMapper } from "../domain/mappers/PermissionMapper";
import type { Permission, PermissionPattern, PermissionValidationResult } from "../domain/models/Permission";
import type {
  PermissionString,
  Resource,
  CrudAction,
  CustomAction,
} from "../domain/types/permission-registry";
import { PERMISSION_REGISTRY } from "../domain/types/permission-registry";

export class PermissionService {
  validatePermission(permission: PermissionString): PermissionValidationResult {
    try {
      const permissionObj = PermissionMapper.fromPermissionString(permission);
      const isValid = !!PERMISSION_REGISTRY[permissionObj.resource]?.[permissionObj.action];
      return {
        isValid,
        error: isValid ? undefined : `Invalid permission: ${permission}`,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Invalid permission format: ${permission}`,
      };
    }
  }

  validatePermissions(permissions: PermissionString[]): PermissionValidationResult {
    for (const permission of permissions) {
      const result = this.validatePermission(permission);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  }

  permissionMatches(pattern: PermissionPattern, permission: Permission): boolean {
    // Handle full wildcard
    if (pattern.resource === "*" && pattern.action === "*") return true;

    // Check if resource matches (either exact match or wildcard)
    const resourceMatches = pattern.resource === "*" || pattern.resource === permission.resource;

    // Check if action matches (either exact match or wildcard)
    const actionMatches = pattern.action === "*" || pattern.action === permission.action;

    return resourceMatches && actionMatches;
  }

  getAllPermissions(): Permission[] {
    const permissions: Permission[] = [];

    Object.entries(PERMISSION_REGISTRY).forEach(([resource, actions]) => {
      Object.entries(actions).forEach(([action, details]) => {
        permissions.push({
          resource: resource as Resource,
          action: action as CrudAction | CustomAction,
          description: details.description,
          category: details.category,
        });
      });
    });

    return permissions;
  }

  getPermissionsByResource(resource: Resource): Permission[] {
    const resourcePermissions = PERMISSION_REGISTRY[resource];
    if (!resourcePermissions) return [];

    return Object.entries(resourcePermissions).map(([action, details]) => ({
      resource,
      action: action as CrudAction | CustomAction,
      description: details.description,
      category: details.category,
    }));
  }

  getPermissionsByCategory(category: string) {
    return this.getAllPermissions().filter((p) => p.category === category);
  }

  getPermissionCategories(): string[] {
    return Array.from(
      new Set(
        this.getAllPermissions()
          .map((p) => p.category)
          .filter((category): category is string => category !== undefined)
      )
    );
  }

  getPermissionsByAction(action: CrudAction | CustomAction): Permission[] {
    return this.getAllPermissions().filter((p) => p.action === action);
  }
}
