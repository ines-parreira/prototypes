export enum PhoneCallDirection {
    Inbound = 'inbound',
    OutboundApi = 'outbound-api',
    OutboundDial = 'outbound-dial',
}

export enum PhoneType {
    Local = 'Local',
    TollFree = 'TollFree',
    Mobile = 'Mobile',
    National = 'National',
}

export enum PhoneCountry {
    CA = 'CA',
    US = 'US',
    GB = 'GB',
    AU = 'AU',
    FR = 'FR',
}

export enum PhoneFunction {
    Standard = 'standard',
    Ivr = 'ivr',
}

export enum TwilioErrorCode {
    AuthorizationAccessTokenInvalid = 20101,
    AuthorizationAccessTokenExpired = 20104,
    AuthorizationAuthenticationFailed = 20151,

    ClientBadRequest = 31400,

    GeneralUnknown = 31000,
    GeneralConnection = 31005,
    GeneralCallCancelled = 31008,
    GeneralTransport = 31009,

    UserMediaPermissionDenied = 31401,
    UserMediaAcquisitionFailedError = 31402,

    SignalingConnectionError = 53000,
    SignalingConnectionDisconnected = 53001,

    MediaClientLocalDescFailed = 53400,
    MediaClientRemoteDescFailed = 53402,
    MediaConnectionError = 53405,
}

export enum CallForwardingCountries {
    US = 'US',
    CA = 'CA',
    FR = 'FR',
    DE = 'DE',
    GB = 'GB',
    IN = 'IN',
    IL = 'IL',
    JP = 'JP',
    AU = 'AU',
}
