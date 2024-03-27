import React, {useMemo} from 'react'
import {Redirect} from 'react-router-dom'
import {isEmpty} from 'lodash'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useGetSortedIntegrations} from 'pages/convert/common/hooks/useGetSortedIntegrations'
import {useGetOnboardingStatusMap} from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import {useIsConvertOnboardingUiEnabled} from 'pages/convert/common/hooks/useIsConvertOnboardingUiEnabled'

const ConvertRoute = () => {
    const sortedIntegrations = useGetSortedIntegrations()
    const {onboardingMap, isLoading} = useGetOnboardingStatusMap()
    const isOnboardingEnabled = useIsConvertOnboardingUiEnabled()
    const flags = useFlags()

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
            return `/app/convert/${integration.id}/campaigns`
        }
        return `/app/convert/${integration.id}/setup`
    }, [isOnboardingEnabled, onboardingMap, sortedIntegrations])

    if (isEmpty(flags) || isLoading) {
        return null
    }

    return <Redirect to={url} />
}
export default ConvertRoute
