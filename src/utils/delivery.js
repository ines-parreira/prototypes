//@flow
function getUSPSTrackingUrl(trackingNumber: string): string {
    return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`
}

function getUPSTrackingUrl(trackingNumber: string): string {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`
}

function getFedexTrackingUrl(trackingNumber: string): string {
    return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`
}

function getCanadaPostTrackingUrl(trackingNumber: string): string {
    return `https://www.canadapost.ca/trackweb/en#/search?searchFor=${trackingNumber}`
}

function getDHLTrackingUrl(trackingNumber: string): string {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}&brand=DHL`
}

export function getTrackingUrl(
    trackingNumber: string,
    carrierCode: string
): string {
    switch (carrierCode) {
        case 'usps':
            return getUSPSTrackingUrl(trackingNumber)
        case 'ups':
            return getUPSTrackingUrl(trackingNumber)
        case 'fedex':
            return getFedexTrackingUrl(trackingNumber)
        case 'canada_post':
            return getCanadaPostTrackingUrl(trackingNumber)
        case 'dhl':
            return getDHLTrackingUrl(trackingNumber)
        default:
            return ''
    }
}
