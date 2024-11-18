import {useFlags} from 'launchdarkly-react-client-sdk'
import {isEmpty} from 'lodash'
import React, {useMemo} from 'react'
import {Redirect} from 'react-router-dom'

import {useGetOnboardingStatusMap} from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import {useGetSortedIntegrations} from 'pages/convert/common/hooks/useGetSortedIntegrations'

import {useIsOverviewPageEnabled} from '../../hooks/useIsOverviewPageEnabled'

const ConvertRoute = () => {
    const sortedIntegrations = useGetSortedIntegrations()
    const {onboardingMap, isLoading} = useGetOnboardingStatusMap()
    const flags = useFlags()
    const isOverviewPageEnabled = useIsOverviewPageEnabled()

    const url = useMemo(() => {
        if (isOverviewPageEnabled) return '/app/convert/overview'

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
    }, [onboardingMap, sortedIntegrations, isOverviewPageEnabled])

    if (isEmpty(flags) || isLoading) {
        return null
    }

    return <Redirect to={url} />
}
export default ConvertRoute
