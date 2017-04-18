interface BoxConfig {
    refreshTokenUrl: string,
    tokenExpirationPeriod?: number;
    boxTokenStorageKey?: string;
}

export const BOX_CONFIG: BoxConfig = {
    refreshTokenUrl: 'https://rrk8eyc9rl.execute-api.us-west-2.amazonaws.com/prototype/api/token',
    tokenExpirationPeriod: 3000000,
    boxTokenStorageKey: 'box_appuser_token'
};