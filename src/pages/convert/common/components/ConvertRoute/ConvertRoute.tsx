import React, {useMemo} from 'react'
import {Redirect} from 'react-router-dom'
import {useGetSortedIntegrations} from '../../hooks/useGetSortedIntegrations'
import {useGetOnboardingStatusMap} from '../../../channelConnections/hooks/useGetOnboardingStatusMap'

const ConvertRoute = () => {
    const sortedIntegrations = useGetSortedIntegrations()
    const onboardingMap = useGetOnboardingStatusMap()

    const url = useMemo(() => {
        if (sortedIntegrations.length === 0) {
            return '/app/convert/setup'
        }

        const integration = sortedIntegrations[0]
        if (
            !!integration.meta.app_id &&
            onboardingMap[integration.meta.app_id]
        ) {
            // TODO: change to campaigns when page exists
            return `/app/convert/${integration.id}/installation`
        }
        return `/app/convert/${integration.id}/setup`
    }, [onboardingMap, sortedIntegrations])

    return <Redirect to={url} />
}
export default ConvertRoute
