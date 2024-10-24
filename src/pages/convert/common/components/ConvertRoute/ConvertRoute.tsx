import {useFlags} from 'launchdarkly-react-client-sdk'
import {isEmpty} from 'lodash'
import React, {useMemo} from 'react'
import {Redirect} from 'react-router-dom'

import {useGetOnboardingStatusMap} from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import {useGetSortedIntegrations} from 'pages/convert/common/hooks/useGetSortedIntegrations'

const ConvertRoute = () => {
    const sortedIntegrations = useGetSortedIntegrations()
    const {onboardingMap, isLoading} = useGetOnboardingStatusMap()
    const flags = useFlags()

    const url = useMemo(() => {
        if (sortedIntegrations.length === 0) {
            return '/app/convert/setup'
        }

        const integration = sortedIntegrations[0]
        if (
            !!integration.meta.app_id &&
            onboardingMap[integration.meta.app_id]
        ) {
            return `/app/convert/${integration.id}/campaigns`
        }
        return `/app/convert/${integration.id}/setup`
    }, [onboardingMap, sortedIntegrations])

    if (isEmpty(flags) || isLoading) {
        return null
    }

    return <Redirect to={url} />
}
export default ConvertRoute
