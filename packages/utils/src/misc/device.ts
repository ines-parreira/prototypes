import { UAParser } from 'ua-parser-js'

type UADeviceType =
    | 'console'
    | 'mobile'
    | 'tablet'
    | 'smarttv'
    | 'wearable'
    | 'embedded'

const MOBILE_DEVICE_TYPES = new Set<UADeviceType>([
    'console',
    'mobile',
    'tablet',
    'smarttv',
    'wearable',
    'embedded',
])

export const getDeviceType = (): UADeviceType | 'desktop' => {
    const parser = new UAParser()
    const deviceType = parser.getDevice().type

    if (
        deviceType === undefined ||
        !MOBILE_DEVICE_TYPES.has(deviceType as UADeviceType)
    ) {
        return 'desktop'
    }

    return deviceType as UADeviceType
}

export const isDesktopDevice = (): boolean => {
    return getDeviceType() === 'desktop'
}
