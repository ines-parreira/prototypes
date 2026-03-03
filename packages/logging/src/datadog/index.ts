export {
    DATADOG_CLIENT_TOKEN,
    DATADOG_LOGS_SERVICE,
    DATADOG_LOGS_SESSION_SAMPLE_RATE,
    DATADOG_RUM_APPLICATION_ID,
    DATADOG_RUM_CLIENT_TOKEN,
    DATADOG_RUM_SERVICE,
    DATADOG_RUM_SESSION_REPLAY_SAMPLE_RATE,
    DATADOG_RUM_SESSION_SAMPLE_RATE,
    DATADOG_SITE,
    initDatadogLogger,
    initDatadogRum,
} from './datadog'
export type {
    DatadogAccount,
    DatadogUser,
    InitDatadogLoggerOptions,
    InitDatadogRumOptions,
} from './datadog'
