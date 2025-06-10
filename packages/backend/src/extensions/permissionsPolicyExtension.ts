// packages/backend/src/plugins/permission.ts

import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  isPermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import type {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { catalogConditions } from '@backstage/plugin-catalog-backend/alpha';
import { catalogEntityReadPermission } from '@backstage/plugin-catalog-common/alpha';

/**
 * Una política de permisos personalizada para LKS.
 * ... (la descripción no cambia) ...
 */
class LksPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {

    // 1. Regla de Super Usuario
    if (user?.identity.userEntityRef === 'user:default/mikel.garcia') {
      return { result: AuthorizeResult.ALLOW };
    }

    // 2. Regla para leer entidades del catálogo
    if (isPermission(request.permission, catalogEntityReadPermission)) {
      return {
        result: AuthorizeResult.CONDITIONAL,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        conditions: catalogConditions.isEntityOwner({
          claims: user?.identity.ownershipEntityRefs ?? [],
        }),
      };
    }
    
    // 3. Para cualquier otra acción, permitimos por defecto.
    return { result: AuthorizeResult.ALLOW };
  }
}

/**
 * El módulo del backend para los permisos, que registra nuestra política personalizada.
 */
// --- INICIO DE CORRECCIÓN ---
// Se cambia 'export const permissionModule =' por 'export default'
export default createBackendModule({
// --- FIN DE CORRECCIÓN ---
  pluginId: 'permission',
  moduleId: 'lks-permission-policy', 
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        console.log('*** Setting custom LKS Permission Policy with super-user and ownership rules ***');
        policy.setPolicy(new LksPermissionPolicy());
      },
    });
  },
});