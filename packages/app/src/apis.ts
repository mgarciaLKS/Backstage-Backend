import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  oauthRequestApiRef,
  microsoftAuthApiRef,
} from '@backstage/core-plugin-api';
import { OAuth2 } from '@backstage/core-app-api';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),

  createApiFactory({
    api: microsoftAuthApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
      configApi: configApiRef,
    },
    factory: ({ discoveryApi, oauthRequestApi, configApi }) => {
      console.log('DEBUG apis.ts: MicrosoftAuthApiFactory está siendo ejecutada.'); // Log #1

      let authEnvFromConfig = 'FALLBACK_VALUE_ENV_NOT_FOUND'; // Valor por defecto para ver si getString falla
      try {
        authEnvFromConfig = configApi.getString('auth.environment');
        console.log( // Log #2
          'DEBUG apis.ts: auth.environment from configApi = ',
          authEnvFromConfig,
        );
      } catch (e: any) {
        console.error( // Log #3
          'DEBUG apis.ts: Error al obtener configApi.getString(\'auth.environment\'): ',
          e.message,
        );
      }

      return OAuth2.create({
        discoveryApi,
        oauthRequestApi,
        configApi,
        provider: {
          id: 'microsoft',
          title: 'Microsoft Azure AD',
          icon: () => null,
        },
        defaultScopes: [
          'openid',
          'profile',
          'email',
          'offline_access',
        ],
        environment: authEnvFromConfig,
      });
    },
  }),
];