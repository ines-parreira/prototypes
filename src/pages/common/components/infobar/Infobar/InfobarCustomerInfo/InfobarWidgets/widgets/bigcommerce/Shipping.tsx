import React, {useContext} from 'react'
import {Map} from 'immutable'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {getTrackingLink} from 'pages/common/components/infobar/utils'
import {StaticField} from '../StaticField'
export default function Shipping() {
    return {
        AfterTitle,
    }
}

type AfterTitleProps = {
    isEditing: boolean
    source: Map<any, any>
}

export function AfterTitle({isEditing, source}: AfterTitleProps) {
    const {integrationId} = useContext(IntegrationContext)

    if (isEditing || !integrationId) {
        return null
    }

    let trackingLink = source.get('tracking_link')
    const trackingNumber = source.get('tracking_number')
    const shippingProvider = source.get('shipping_provider')

    if (!trackingLink && trackingNumber && shippingProvider) {
        trackingLink = getTrackingLink(trackingNumber, shippingProvider)
    }

    return (
        <>
            <StaticField label="Tracking Link">
                {trackingLink ? (
                    <a href={trackingLink}>track order</a>
                ) : (
                    <>N/A</>
                )}
            </StaticField>
        </>
    )
}
