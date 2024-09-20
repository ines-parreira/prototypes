import React, {useEffect, useMemo} from 'react'
import {Link, useParams} from 'react-router-dom'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import {reportError} from 'utils/errors'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import {useAiAgentStoreConfigurationContext} from 'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import {AiAgentGuidanceView} from './AiAgentGuidanceView'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'
import css from './AiAgentGuidanceContainer.less'

export const AiAgentGuidanceContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    const {storeConfiguration, isLoading: isStoreConfigLoading} =
        useAiAgentStoreConfigurationContext()

    const {data: helpCenterListData, isLoading: isLoadingHelpCenters} =
        useGetHelpCenterList(
            {type: 'guidance', per_page: HELP_CENTER_MAX_CREATION},
            {
                staleTime: 1000 * 60 * 5,
            }
        )

    const {routes} = useAiAgentNavigation({shopName})

    const guidanceHelpCenter = useMemo(
        () =>
            storeConfiguration
                ? (helpCenterListData?.data.data ?? []).find(
                      (helpCenter) =>
                          helpCenter.id ===
                          storeConfiguration.guidanceHelpCenterId
                  )
                : undefined,
        [helpCenterListData, storeConfiguration]
    )

    useEffect(() => {
        if (isStoreConfigLoading || isLoadingHelpCenters) {
            return
        }

        if (storeConfiguration && !guidanceHelpCenter) {
            reportError(
                new Error(
                    `Can't find help center with id ${storeConfiguration.guidanceHelpCenterId} and store ${shopName}`
                ),
                {
                    tags: {team: AI_AGENT_SENTRY_TEAM},
                    level: 'error',
                }
            )
        }
    }, [
        guidanceHelpCenter,
        isStoreConfigLoading,
        isLoadingHelpCenters,
        shopName,
        storeConfiguration,
    ])

    if (isStoreConfigLoading || isLoadingHelpCenters) {
        return <Loader data-testid="loader" />
    }

    if (!storeConfiguration || !guidanceHelpCenter) {
        return (
            <AiAgentLayout shopName={shopName} className={css.container}>
                <AutomateViewContent>
                    <Alert icon type={AlertType.Warning}>
                        Please configure your{' '}
                        <Link to={routes.configuration()}>
                            AI Agent settings{' '}
                        </Link>
                        first.
                    </Alert>
                </AutomateViewContent>
            </AiAgentLayout>
        )
    }

    return (
        <AiAgentLayout shopName={shopName} className={css.container}>
            <AiAgentGuidanceView
                helpCenterId={guidanceHelpCenter.id}
                shopName={shopName}
                locale={guidanceHelpCenter.default_locale}
            />
        </AiAgentLayout>
    )
}
