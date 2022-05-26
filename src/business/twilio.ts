import {TwilioError} from '@twilio/voice-sdk'

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

export enum TwilioSocketEventType {
    DeviceRegistered = 'device-registered',
    DeviceUnregistered = 'device-unregistered',
    DeviceError = 'device-error',
    CallIncoming = 'call-incoming',
    CallOutgoing = 'call-outgoing',
    CallAccepted = 'call-accepted',
    CallRejected = 'call-rejected',
    CallCancelled = 'call-cancelled',
    CallDisconnected = 'call-disconnected',
    CallReconnected = 'call-reconnected',
    CallWarningStarted = 'call-warning-started',
    CallWarningEnded = 'call-warning-ended',
    CallError = 'call-error',
}

export type TwilioSocketEvent =
    | {
          type:
              | TwilioSocketEventType.DeviceRegistered
              | TwilioSocketEventType.DeviceUnregistered
      }
    | {
          type: TwilioSocketEventType.DeviceError
          data: {
              error: TwilioError.TwilioError
          }
      }
    | {
          type: TwilioSocketEventType.CallError
          data: {
              id: string
              call_sid: Maybe<string>
              error: TwilioError.TwilioError
          }
      }
    | {
          type:
              | TwilioSocketEventType.CallIncoming
              | TwilioSocketEventType.CallOutgoing
              | TwilioSocketEventType.CallAccepted
              | TwilioSocketEventType.CallRejected
              | TwilioSocketEventType.CallDisconnected
              | TwilioSocketEventType.CallReconnected
              | TwilioSocketEventType.CallCancelled
          data: {
              id: string
              call_sid: Maybe<string>
          }
      }
    | {
          type:
              | TwilioSocketEventType.CallWarningStarted
              | TwilioSocketEventType.CallWarningEnded
          data: {
              id: string
              call_sid: Maybe<string>
              metric_name: string
          }
      }
