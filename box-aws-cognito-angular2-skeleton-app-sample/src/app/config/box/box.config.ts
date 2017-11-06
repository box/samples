interface BoxConfig {
    refreshTokenUrl: string,
    tokenExpirationPeriod?: number;
    boxTokenStorageKey?: string;
}

export const BOX_CONFIG: BoxConfig = {
    refreshTokenUrl: 'https://24fswysvnj.execute-api.us-west-2.amazonaws.com/prod/token',
    tokenExpirationPeriod: 3000000,
    boxTokenStorageKey: 'box_appuser_token'
};