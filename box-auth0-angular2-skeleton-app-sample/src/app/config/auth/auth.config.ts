interface AuthConfiguration {
    clientID: string,
    domain: string,
    callbackUrl: string
}

export const AUTH_CONFIG: AuthConfiguration = {
    clientID: 'onWTVG9uWpFFFQurilG6b7tRUd7k8BDi',
    domain: 'allenm.auth0.com',
    callbackUrl: 'http://localhost:4200/callback'
};
