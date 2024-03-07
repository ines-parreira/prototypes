import React, {useMemo} from 'react'

import {useParams} from 'react-router-dom'
import {withCanduPaywall} from 'pages/common/components/Paywall/CanduPaywall'

import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {ConvertFeatures} from 'pages/convert/common/components/ConvertPaywallView/constants'
import ConvertPaywallView from 'pages/convert/common/components/ConvertPaywallView'

const TITLE = 'Click tracking'

const ClickTrackingPaywallView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()

    const redirectUrl = useMemo(() => {
        if (!!integrationId) {
            return `/app/convert/${integrationId}/click-tracking`
        }
        return `/app/settings/convert/click-tracking`
    }, [integrationId])

    return (
        <ConvertPaywallView
            convertFeature={ConvertFeatures.Default}
            modalCanduId={'click-tracking-paywall-modal'}
            onSubscribedRedirectPath={redirectUrl}
            pageHeaderTitle={TITLE}
        />
    )
}

export default withCanduPaywall({
    title: TITLE,
    canduId: 'click-tracking-paywall',
})(ClickTrackingPaywallView)
