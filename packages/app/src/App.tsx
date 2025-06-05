// --- IMPORTACIONES ---
import { Navigate, Route } from 'react-router-dom'; // Necesario para 'routes'
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
// import { SearchPage } from '@backstage/plugin-search'; // Tu SearchPage custom
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root'; // <--- VUELVE A IMPORTAR TU ROOT (simplificado por ahora)

import {
  AlertDisplay,
  OAuthRequestDialog,
} from '@backstage/core-components';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api'; // <--- VUELVE A IMPORTAR AppRouter y FlatRoutes
// import { useApi, microsoftAuthApiRef } from '@backstage/core-plugin-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
// import { useEffect } from 'react'; // React se importa globalmente o vía React.useEffect si es necesario
import { MyCustomSignInPage } from './components/MyCustomSignInPage'; // Importa tu página custom
// --- FIN IMPORTACIONES ---

console.log("DEBUG App.tsx: Pasando estas APIs a createApp:", apis);

const app = createApp({
  apis,
  components: {
    SignInPage: (props) => ( // Sigue siendo la prop SignInPage
      <MyCustomSignInPage {...props} /> // Usa tu componente personalizado
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

// // -------- TestApiComponent (se mantiene) --------
// const TestApiComponent = () => {
//   const authApiInstance = useApi(microsoftAuthApiRef);
//   useEffect(() => {
//     if (authApiInstance) {
//       console.log("DEBUG App.tsx TestApiComponent: Intentando obtener accessToken y profileInfo");
//       authApiInstance.getAccessToken()
//         .then((token: string | undefined) => {
//           console.log("DEBUG App.tsx TestApiComponent: AccessToken obtenido:", token ? token.substring(0, 20) + "..." : token);
//         })
//         .catch((err: any) => {
//           console.error("DEBUG App.tsx TestApiComponent: Error al obtener accessToken:", err);
//         });
//       if ('getProfile' in authApiInstance && typeof authApiInstance.getProfile === 'function') {
//         authApiInstance.getProfile()
//           .then((profile: any) => {
//             console.log("DEBUG App.tsx TestApiComponent: Profile obtenido:", profile);
//           })
//           .catch((err: any) => {
//             console.error("DEBUG App.tsx TestApiComponent: Error al obtener profile:", err);
//           });
//       } else {
//         console.warn("DEBUG App.tsx TestApiComponent: authApiInstance no tiene método getProfile");
//       }
//     }
//   }, [authApiInstance]);
//   return null;
// };
// -------- Fin TestApiComponent --------

// --- VUELVEN LAS RUTAS ORIGINALES ---
const routes = (
  <FlatRoutes>
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
    <Route path="/search" element={searchPage} />
    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
  </FlatRoutes>
);
// --- FIN RUTAS ORIGINALES ---

export default app.createRoot(
  <>
    {/* <TestApiComponent /> Mantenlo para que se haga el login */}

    <AlertDisplay/>
    <OAuthRequestDialog />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);