import {TwilioError} from '@twilio/voice-sdk'

export const MAX_DEVICE_RECONNECT_ATTEMPTS = 5
export const DEFAULT_ERROR_MESSAGE =
    'An error has occurred while trying to connect to the Gorgias Voice application. Please refresh your browser to reset the connection. If the problem persists, please reach out to support. '
export const DEFAULT_WARNING_MESSAGE =
    'Poor network connection detected. Voice calls cannot be properly received or made until connection improves. Try restarting the network on your device.'

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

export enum VoiceAppErrorCode {
    TooManyReconnectionAttepts = 1,
    HttpsProtoRequired = 2,
    MissingOrInvalidToken = 3,
}
export class VoiceAppError extends Error {
    code: VoiceAppErrorCode

    static messages: Record<VoiceAppErrorCode, string> = {
        [VoiceAppErrorCode.TooManyReconnectionAttepts]:
            'Too many failed attempts at connecting to Twilio',
        [VoiceAppErrorCode.HttpsProtoRequired]:
            'Cannot use the voice application without HTTPS',
        [VoiceAppErrorCode.MissingOrInvalidToken]:
            'Missing or invalid JWT token',
    }

    constructor(code: VoiceAppErrorCode) {
        super(VoiceAppError.messages[code])
        this.code = code
    }
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
    CallRecordingStarted = 'call-recording-started',
    CallRecordingPaused = 'call-recording-paused',
    CallMuted = 'call-muted',
    CallUnmuted = 'call-unmuted',
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
              | TwilioSocketEventType.CallRecordingStarted
              | TwilioSocketEventType.CallRecordingPaused
              | TwilioSocketEventType.CallMuted
              | TwilioSocketEventType.CallUnmuted
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
