import {
    FEDEX_BASE_TRACKING_LINK,
    UPS_BASE_TRACKING_LINK,
    USPS_BASE_TRACKING_LINK,
} from './constants'

/** Compute the tracking URL based on the tracking number and the shipping provider. **/
export default function getTrackingLink(
    trackingNumber: string,
    provider: string
): string | null {
    switch (provider) {
        case 'fedex': {
            return `${FEDEX_BASE_TRACKING_LINK}${trackingNumber}`
        }
        case 'ups':
        case 'upsready': {
            return `${UPS_BASE_TRACKING_LINK}${trackingNumber}`
        }
        case 'usps': {
            return `${USPS_BASE_TRACKING_LINK}${trackingNumber}`
        }
        default: {
            return null
        }
    }
}
