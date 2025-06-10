import { useCallback, useEffect, useState } from 'react';
import { useApi, microsoftAuthApiRef, IdentityApi } from '@backstage/core-plugin-api';
import { Button, Grid, Typography, CircularProgress } from '@material-ui/core';
import { SignInPageProps } from '@backstage/core-app-api';
export const MyCustomSignInPage = (props: SignInPageProps) => {
  const microsoftAuth = useApi(microsoftAuthApiRef);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    microsoftAuth.getBackstageIdentity()
      .then(identityResponse => {
        if (identityResponse?.identity) {
          const identityApiAdapter: IdentityApi = {
            getProfileInfo: async () => {
              return (await microsoftAuth.getProfile()) ?? {};
            },
            getBackstageIdentity: async () => {
              const response = await microsoftAuth.getBackstageIdentity();
              if (!response) {
                throw new Error('La identidad de Backstage no se encontró después de un inicio de sesión aparentemente exitoso.');
              }
              return response.identity;
            },
            getCredentials: async () => {
              const response = await microsoftAuth.getBackstageIdentity();
              return { token: response?.token };
            },
            signOut: async () => {
              return await microsoftAuth.signOut();
            },
          };
          props.onSignInSuccess(identityApiAdapter);
        }
      })
       .catch(() => {
       });
  }, [microsoftAuth, props]);

  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      await microsoftAuth.getBackstageIdentity({ optional: false });
    } catch (error) {
      setIsLoading(false);
    }
  }, [microsoftAuth]);

  return (
    <Grid container justifyContent="center" spacing={2} style={{ marginTop: '2em' }}>
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        <Typography variant="h5">Iniciar Sesión</Typography>
      </Grid>
      <Grid item xs={12} style={{ textAlign: 'center' }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
          >
            Iniciar Sesión con Microsoft Azure AD
          </Button>
        )}
      </Grid>
    </Grid>
  );
};