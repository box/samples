interface BoxConfig {
    refreshTokenUrl: string,
    tokenExpirationPeriod?: number;
    boxTokenStorageKey?: string;
}

export const BOX_CONFIG: BoxConfig = {
    refreshTokenUrl: 'https://allenm.us.webtask.io/auth0-box-platform/api/token',
    tokenExpirationPeriod: 3000000,
    boxTokenStorageKey: 'box_appuser_token'
};