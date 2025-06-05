// packages/app/src/components/MyCustomSignInPage.tsx

// Quitado 'import React from 'react';' - no debería ser necesario para JSX con config moderna.
// Si 'yarn tsc' se queja de que React debe estar en el scope para JSX, entonces vuelve a añadir:
// import React from 'react';

import { useApi, microsoftAuthApiRef, BackstageIdentityResponse } from '@backstage/core-plugin-api';
import { Button, Grid, Typography } from '@material-ui/core';
import { SignInPageProps } from '@backstage/core-app-api';

export const MyCustomSignInPage = (_props: SignInPageProps) => {
  // '_props' para indicar que es recibido pero no usado activamente en esta implementación.
  const microsoftAuth = useApi(microsoftAuthApiRef);

  const handleLogin = () => {
    console.log("MyCustomSignInPage: Botón de login presionado. Iniciando flujo para obtener identidad...");

    // La instancia 'microsoftAuth' ya es del tipo correcto (intersección)
    // que incluye BackstageIdentityApi, por lo que podemos llamar a getBackstageIdentity directamente.
    microsoftAuth.getBackstageIdentity({ optional: false })
      .then((identity?: BackstageIdentityResponse) => {
        console.log("MyCustomSignInPage: getBackstageIdentity se resolvió después del flujo.", identity);
        // El sistema de Backstage llamará a _props.onSignInSuccess si este flujo
        // resulta en una identidad válida.
      })
      .catch((error: Error) => {
        console.error("MyCustomSignInPage: Error al intentar obtener Backstage Identity o durante el flujo:", error);
      });
  };

  return (
    <Grid container justifyContent="center" spacing={2} style={{ marginTop: '2em' }}>
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        <Typography variant="h5">Iniciar Sesión</Typography>
      </Grid>
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
        >
          Iniciar Sesión con Microsoft Azure AD
        </Button>
      </Grid>
    </Grid>
  );
};