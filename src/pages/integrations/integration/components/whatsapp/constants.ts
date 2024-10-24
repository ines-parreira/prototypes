import {CountryCode} from 'libphonenumber-js'

import {WhatsAppMessageTemplateStatus} from 'models/whatsAppMessageTemplates/types'
import {AlertType} from 'pages/common/components/Alert/Alert'

export const templateAlertContent: Partial<
    Record<
        WhatsAppMessageTemplateStatus,
        {type: AlertType; message: string; tooltip: string}
    >
> = {
    [WhatsAppMessageTemplateStatus.Paused]: {
        type: AlertType.Warning,
        message:
            'This template received recurring negative feedback from customers and is not usable for up to 6h.',
        tooltip:
            'Received recurring negative feedback. Not usable for up to 6h.',
    },
    [WhatsAppMessageTemplateStatus.Disabled]: {
        type: AlertType.Warning,
        message:
            'This template received recurring negative feedback from customers. Re-edit and appeal the decision.',
        tooltip: 'Receiving recurring negative feedback. Re-edit and appeal.',
    },
    [WhatsAppMessageTemplateStatus.Rejected]: {
        type: AlertType.Warning,
        message:
            'This template violates WhatsApp policies and cannot be used. Re-submit or appeal the decision.',
        tooltip: 'Violates WhatsApp policies. Re-submit or appeal.',
    },
    [WhatsAppMessageTemplateStatus.Unsupported]: {
        type: AlertType.Info,
        message: 'This template contains content not yet supported by Gorgias.',
        tooltip: 'Contains content not supported by Gorgias.',
    },
}

export const whatsAppFlagCodes = {
    af: 'ZA',
    ar: 'EG',
    az: 'AZ',
    bg: 'BG',
    bn: 'BD',
    ca: 'ES',
    cs: 'CZ',
    da: 'DK',
    de: 'DE',
    el: 'GR',
    en: 'US',
    es: 'ES',
    et: 'EE',
    en_GB: 'GB',
    en_US: 'US',
    es_AR: 'AR',
    es_ES: 'ES',
    es_MX: 'MX',
    fa: 'IR',
    fi: 'FI',
    fr: 'FR',
    fil: 'PH',
    gu: 'IN',
    ga: 'IE',
    he: 'IL',
    hi: 'IN',
    hr: 'HR',
    hu: 'HU',
    ha: 'NG',
    id: 'ID',
    it: 'IT',
    ja: 'JP',
    kn: 'IN',
    ko: 'KR',
    ka: 'GE',
    kk: 'KZ',
    ky_KG: 'KG',
    lt: 'LT',
    lv: 'LV',
    lo: 'LA',
    mk: 'MK',
    ml: 'IN',
    mr: 'IN',
    ms: 'MY',
    nl: 'NL',
    nb: 'NO',
    pa: 'IN',
    pl: 'PL',
    pt_BR: 'BR',
    pt_PT: 'PT',
    ro: 'RO',
    ru: 'RU',
    rw_RW: 'RW',
    sk: 'SK',
    sl: 'SI',
    sq: 'AL',
    sv: 'SE',
    sw: 'TZ',
    sr: 'RS',
    ta: 'IN',
    te: 'IN',
    tr: 'TR',
    th: 'TH',
    uk: 'UA',
    ur: 'PK',
    uz: 'UZ',
    vi: 'VN',
    zh_CN: 'CN',
    zh_TW: 'TW',
    zh_HK: 'HK',
    zu: 'ZA',
} as Record<string, CountryCode>
