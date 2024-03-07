import React, {useMemo} from 'react'
import {Redirect} from 'react-router-dom'
import {useGetSortedIntegrations} from '../../hooks/useGetSortedIntegrations'
import {useGetOnboardingStatusMap} from '../../../channelConnections/hooks/useGetOnboardingStatusMap'
import {useIsConvertOnboardingUiEnabled} from '../../hooks/useIsConvertOnboardingUiEnabled'

const ConvertRoute = () => {
    const sortedIntegrations = useGetSortedIntegrations()
    const onboardingMap = useGetOnboardingStatusMap()
    const isOnboardingEnabled = useIsConvertOnboardingUiEnabled()

    const url = useMemo(() => {
        if (sortedIntegrations.length === 0) {
            if (isOnboardingEnabled) {
                return '/app/convert/setup'
            }
            // redirect to Chat page until onboarding is enabled
            return '/app/settings/channels/gorgias_chat/new/create-wizard'
        }

        const integration = sortedIntegrations[0]
        if (
            (!!integration.meta.app_id &&
                onboardingMap[integration.meta.app_id]) ||
            !isOnboardingEnabled
        ) {
            // TODO: change to campaigns when page exists
            return `/app/convert/${integration.id}/installation`
        }
        return `/app/convert/${integration.id}/setup`
    }, [isOnboardingEnabled, onboardingMap, sortedIntegrations])

    return <Redirect to={url} />
}
export default ConvertRoute
