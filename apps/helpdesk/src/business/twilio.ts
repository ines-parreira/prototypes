import type { TwilioError } from '@twilio/voice-sdk'
import type { CountryCode } from 'libphonenumber-js'

import type { PhoneCapabilities } from 'models/phoneNumber/types'
import type { SelectableOption } from 'pages/common/forms/SelectField/types'
import rawAuAreaCodeOptions from 'pages/phoneNumbers/options/area-codes/au.json'
import rawCaAreaCodeOptions from 'pages/phoneNumbers/options/area-codes/ca.json'
import rawTollFreeAreaCodeOptions from 'pages/phoneNumbers/options/area-codes/toll-free.json'
import rawUsAreaCodeOptions from 'pages/phoneNumbers/options/area-codes/us.json'

export const MAX_DEVICE_RECONNECT_ATTEMPTS = 5
export const DEFAULT_ERROR_MESSAGE =
    'An error has occurred while trying to connect to the Gorgias Voice application. Please refresh your browser to reset the connection. If the problem persists, please reach out to support.'
export const DEFAULT_WARNING_MESSAGE =
    'Poor network connection detected. Voice calls cannot be properly received or made until connection improves. Try restarting the network on your device.'
export const MICROPHONE_PERMISSION_ERROR_MESSAGE =
    'Update your browser settings to allow microphone access so you can place outbound calls'

export const TOLL_FREE_AREA_CODE_OPTIONS: SelectableOption[] =
    rawTollFreeAreaCodeOptions

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

export const PHONE_TYPE_LABELS: Record<PhoneType, string> = {
    [PhoneType.Local]: 'Local',
    [PhoneType.TollFree]: 'Toll-free',
    [PhoneType.Mobile]: 'Mobile',
    [PhoneType.National]: 'National',
}

export const CAPABILITY_TYPE_LABELS: Record<keyof PhoneCapabilities, string> = {
    mms: 'MMS',
    sms: 'SMS',
    voice: 'Voice',
    whatsapp: 'WhatsApp',
}

export enum PhoneCountry {
    AT = 'AT', // Austria
    AU = 'AU', // Australia
    BE = 'BE', // Belgium
    BR = 'BR', // Brazil
    CA = 'CA', // Canada
    CH = 'CH', // Switzerland
    CZ = 'CZ', // Czech Republic
    DE = 'DE', // Germany
    DK = 'DK', // Denmark
    ES = 'ES', // Spain
    FI = 'FI', // Finland
    FR = 'FR', // France
    GB = 'GB', // United Kingdom
    HK = 'HK', // Hong Kong
    HU = 'HU', // Hungary
    IE = 'IE', // Ireland
    IL = 'IL', // Israel
    IN = 'IN', // India
    IT = 'IT', // Italy
    LU = 'LU', // Luxembourg
    MX = 'MX', // Mexico
    NL = 'NL', // Netherlands
    NO = 'NO', // Norway
    NZ = 'NZ', // New Zealand
    PL = 'PL', // Poland
    PT = 'PT', // Portugal
    RO = 'RO', // Romania
    SE = 'SE', // Sweden
    US = 'US', // United States
    ZA = 'ZA', // South Africa
}

type PhoneTypeConfig = {
    selfService?: boolean
    addressValidation?: boolean
    areaCodeOptions?: SelectableOption[] | Record<string, SelectableOption[]>
}

export const phoneCountryConfig: Record<
    PhoneCountry,
    {
        name: string
        adjective: string
        phoneTypeConfig: Partial<Record<PhoneType, PhoneTypeConfig>>
        unavailableForCreation?: boolean
    }
> = {
    [PhoneCountry.AU]: {
        name: 'Australia',
        adjective: 'Australian',
        phoneTypeConfig: {
            [PhoneType.Local]: {
                addressValidation: true,
                selfService: true,
                areaCodeOptions: rawAuAreaCodeOptions,
            },
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.AT]: {
        name: 'Austria',
        adjective: 'Austrian',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.National]: {},
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.BE]: {
        name: 'Belgium',
        adjective: 'Belgian',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.BR]: {
        name: 'Brazil',
        adjective: 'Brazilian',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.National]: {},
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.CA]: {
        name: 'Canada',
        adjective: 'Canadian',
        phoneTypeConfig: {
            [PhoneType.Local]: {
                selfService: true,
                areaCodeOptions: rawCaAreaCodeOptions,
            },
            [PhoneType.TollFree]: {
                selfService: true,
                areaCodeOptions: TOLL_FREE_AREA_CODE_OPTIONS,
            },
        },
    },
    [PhoneCountry.CZ]: {
        name: 'Czech Republic',
        adjective: 'Czech',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.National]: {
                addressValidation: true,
                selfService: true,
            },
        },
    },
    [PhoneCountry.DK]: {
        name: 'Denmark',
        adjective: 'Danish',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
        },
    },
    [PhoneCountry.FI]: {
        name: 'Finland',
        adjective: 'Finnish',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.Mobile]: {
                addressValidation: true,
                selfService: true,
            },
        },
    },
    [PhoneCountry.FR]: {
        name: 'France',
        adjective: 'French',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.National]: {},
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.DE]: {
        name: 'Germany',
        adjective: 'German',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.HK]: {
        name: 'Hong Kong',
        adjective: 'Hong Kong',
        phoneTypeConfig: {
            [PhoneType.National]: {},
        },
    },
    [PhoneCountry.HU]: {
        name: 'Hungary',
        adjective: 'Hungarian',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
        },
    },
    [PhoneCountry.IE]: {
        name: 'Ireland',
        adjective: 'Irish',
        phoneTypeConfig: {
            [PhoneType.Local]: {
                selfService: true,
                addressValidation: true,
            },
        },
    },
    [PhoneCountry.IL]: {
        name: 'Israel',
        adjective: 'Israeli',
        phoneTypeConfig: {
            [PhoneType.Local]: {
                selfService: true,
            },
            [PhoneType.National]: {
                selfService: true,
            },
        },
    },
    [PhoneCountry.IN]: {
        name: 'India',
        adjective: 'Indian',
        phoneTypeConfig: {},
        unavailableForCreation: true,
    },
    [PhoneCountry.IT]: {
        name: 'Italy',
        adjective: 'Italian',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
        },
    },
    [PhoneCountry.LU]: {
        name: 'Luxembourg',
        adjective: 'Luxembourgian',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
        },
    },
    [PhoneCountry.MX]: {
        name: 'Mexico',
        adjective: 'Mexican',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
        },
    },
    [PhoneCountry.NL]: {
        name: 'Netherlands',
        adjective: 'Dutch',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.National]: {},
            [PhoneType.Mobile]: {
                selfService: true,
                addressValidation: true,
            },
        },
    },
    [PhoneCountry.NZ]: {
        name: 'New Zealand',
        adjective: 'New Zealand',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
        },
    },
    [PhoneCountry.NO]: {
        name: 'Norway',
        adjective: 'Norwegian',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
        },
    },
    [PhoneCountry.PL]: {
        name: 'Poland',
        adjective: 'Polish',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.PT]: {
        name: 'Portugal',
        adjective: 'Portuguese',
        phoneTypeConfig: {
            [PhoneType.National]: {},
        },
    },
    [PhoneCountry.RO]: {
        name: 'Romania',
        adjective: 'Romanian',
        phoneTypeConfig: {
            [PhoneType.National]: {},
        },
    },
    [PhoneCountry.ZA]: {
        name: 'South Africa',
        adjective: 'South African',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.National]: {},
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.ES]: {
        name: 'Spain',
        adjective: 'Spanish',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.SE]: {
        name: 'Sweden',
        adjective: 'Swedish',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.National]: {},
            [PhoneType.Mobile]: {
                selfService: true,
                addressValidation: true,
            },
        },
    },
    [PhoneCountry.CH]: {
        name: 'Switzerland',
        adjective: 'Swiss',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
        },
    },
    [PhoneCountry.GB]: {
        name: 'United Kingdom',
        adjective: 'British',
        phoneTypeConfig: {
            [PhoneType.Local]: {},
            [PhoneType.National]: {},
            [PhoneType.Mobile]: {},
        },
    },
    [PhoneCountry.US]: {
        name: 'United States',
        adjective: 'American',
        phoneTypeConfig: {
            [PhoneType.Local]: {
                selfService: true,
                areaCodeOptions: rawUsAreaCodeOptions,
            },
            [PhoneType.TollFree]: {
                selfService: true,
                areaCodeOptions: TOLL_FREE_AREA_CODE_OPTIONS,
            },
        },
    },
}

export const countryOptions: SelectableOption[] = Object.entries(
    phoneCountryConfig,
)
    .filter(([, value]) => !value.unavailableForCreation)
    .map(([key, value]) => ({
        label: value.name,
        value: key,
    }))

export enum PhoneFunction {
    Standard = 'standard',
    Ivr = 'ivr',
}

export enum PhoneUseCase {
    Standard = 'standard',
    Marketing = 'marketing',
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

export const callForwardingCountries = Object.keys(
    phoneCountryConfig,
) as CountryCode[]

/**
 * Warning data structure provided by Twilio SDK when a call quality warning is triggered.
 * Contains detailed metrics about the warning condition.
 */
export type TwilioCallWarningData = {
    /** The name of the stat that triggered the warning (e.g., 'rtt', 'mos') */
    name: string
    /** Array of metric values from the past 5 samples */
    values: number[]
    /** Array of WebRTC sample objects with detailed stats */
    samples: Array<Record<string, unknown>>
    /** Threshold configuration that was crossed */
    threshold: {
        /** Threshold type (e.g., 'min', 'max') */
        name: string
        /** The threshold value that was crossed */
        value: number
    }
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
              warning_data: TwilioCallWarningData
          }
      }
