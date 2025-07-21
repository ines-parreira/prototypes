import React, { useContext } from 'react'

import { Map } from 'immutable'

import { getTrackingLink } from 'common/tracking'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { CardCustomization } from 'Widgets/modules/Template/modules/Card/types'
import StaticField from 'Widgets/modules/Template/modules/Field/components/StaticField'

export const shippingCustomization: CardCustomization = {
    AfterTitle,
}

type AfterTitleProps = {
    isEditing: boolean
    source: Map<any, any>
}

export function AfterTitle({ isEditing, source }: AfterTitleProps) {
    const { integrationId } = useContext(IntegrationContext)

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
