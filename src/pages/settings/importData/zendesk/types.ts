export enum ImportStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    RateLimitExceededBackoff = 'rate_limit_exceeded_back_off',
}

export const ZENDESK_CONNECTION_TYPE = 'zendesk_auth_data'
