import {UAParser} from 'ua-parser-js'
import * as utils from './device'

type UADeviceType =
    | 'console'
    | 'mobile'
    | 'tablet'
    | 'smarttv'
    | 'wearable'
    | 'embedded'

export const getDeviceType = (): UADeviceType | 'desktop' => {
    const parser = new UAParser()
    const deviceType = parser.getDevice().type

    if (
        deviceType === undefined ||
        ![
            'console',
            'mobile',
            'tablet',
            'smarttv',
            'wearable',
            'embedded',
        ].includes(deviceType)
    ) {
        return 'desktop'
    }

    return deviceType as UADeviceType
}

export const isDesktopDevice = (): boolean => {
    return utils.getDeviceType() === 'desktop'
}
