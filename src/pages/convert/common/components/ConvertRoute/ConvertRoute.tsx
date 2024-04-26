import React, {useMemo} from 'react'
import {Redirect} from 'react-router-dom'
import {isEmpty} from 'lodash'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useGetSortedIntegrations} from 'pages/convert/common/hooks/useGetSortedIntegrations'
import {useGetOnboardingStatusMap} from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'

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
