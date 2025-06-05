import { Navigate, Route } from 'react-router-dom';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
// import { SearchPage } from '@backstage/plugin-search'; // No usar el SearchPage de plugin-search directamente
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { apis } from './apis'; // Tu archivo apis.ts con los console.log
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage'; // Importa el export correcto (JSX)
import { Root } from './components/Root';

import {
  AlertDisplay,
  OAuthRequestDialog,
  ProxiedSignInPage,
} from '@backstage/core-components';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { useApi, microsoftAuthApiRef } from '@backstage/core-plugin-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import React from 'react';

// Log para ver el array de APIs que se pasa a createApp
console.log("DEBUG App.tsx: Pasando estas APIs a createApp:", apis);

const app = createApp({
  apis,
  components: {
    SignInPage: (props) => (
      <ProxiedSignInPage
        {...props}
        provider="microsoft"
      />
    ),
  },
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
});

// -------- Inicio de Bloque de Debug para forzar uso de API --------
const TestApiComponent = () => {
  const authApiInstance = useApi(microsoftAuthApiRef);

  React.useEffect(() => {
    if (authApiInstance) {
      console.log("DEBUG App.tsx TestApiComponent: Intentando obtener accessToken y profileInfo");
      authApiInstance.getAccessToken()
        .then((token: string | undefined) => {
          console.log("DEBUG App.tsx TestApiComponent: AccessToken obtenido:", token);
        })
        .catch((err: any) => {
          console.error("DEBUG App.tsx TestApiComponent: Error al obtener accessToken:", err);
        });
      if ('getProfile' in authApiInstance && typeof authApiInstance.getProfile === 'function') {
        authApiInstance.getProfile()
          .then((profile: any) => {
            console.log("DEBUG App.tsx TestApiComponent: Profile obtenido:", profile);
          })
          .catch((err: any) => {
            console.error("DEBUG App.tsx TestApiComponent: Error al obtener profile:", err);
          });
      } else {
        console.warn("DEBUG App.tsx TestApiComponent: authApiInstance no tiene método getProfile");
      }
    }
  }, [authApiInstance]);

  return null; // Este componente no renderiza nada visible
};
// -------- Fin de Bloque de Debug --------

const routes = (
  <FlatRoutes>
    {/* La ruta de TestApiComponent ya no es necesaria aquí si lo renderizamos directamente en createRoot */}
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />} />
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    {/* Usa el export JSX searchPage directamente como elemento */}
    <Route path="/search" element={searchPage} />
    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
  </FlatRoutes>
);

export default app.createRoot(
  <>
    <TestApiComponent /> {/* Renderizamos el componente de prueba aquí */}
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);