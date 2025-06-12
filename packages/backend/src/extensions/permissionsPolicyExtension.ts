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

    // === INICIO DE MODIFICACIÓN: Administrador por Grupo ===
    // En lugar de comprobar un usuario específico, ahora se comprueba si el usuario
    // es miembro del grupo 'equipo-qa'.
    // La referencia completa del grupo es 'group:default/equipo-qa'.
    if (user?.identity.ownershipEntityRefs.includes('group:default/team-qa')) {
      return { result: AuthorizeResult.ALLOW };
    }
    // === FIN DE MODIFICACIÓN ===

    // 2. Regla para leer entidades del catálogo
    // Se mantiene la lógica original. Funcionará para ver los grupos si
    // estos tienen el campo "spec.owner" apuntando a sí mismos.
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
    
    // 3. Para cualquier otra acción, permitimos por defecto (según tu código original).
    // Nota: Para un entorno productivo, se recomienda cambiar esto a DENY 
    // y añadir permisos explícitos para cada acción necesaria.
    return { result: AuthorizeResult.ALLOW };
  }
}

/**
 * El módulo del backend para los permisos, que registra nuestra política personalizada.
 */
export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'lks-permission-policy', 
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        console.log('*** Setting custom LKS Permission Policy with group-admin and ownership rules ***');
        policy.setPolicy(new LksPermissionPolicy());
      },
    });
  },
});