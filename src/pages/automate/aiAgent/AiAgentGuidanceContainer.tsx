import React, {useEffect, useMemo} from 'react'
import {Link, useParams} from 'react-router-dom'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useAppSelector from 'hooks/useAppSelector'
import {getHelpCenterGuidanceList} from 'state/entities/helpCenter/helpCenters/selectors'
import Loader from 'pages/common/components/Loader/Loader'
import {reportError} from 'utils/errors'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import AutomateViewContent from '../common/components/AutomateViewContent'
import {AiAgentGuidanceView} from './AiAgentGuidanceView'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'
import css from './AiAgentGuidanceContainer.less'
import {useAiAgentStoreConfigurationContext} from './providers/AiAgentStoreConfigurationContext'

export const AiAgentGuidanceContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    const {storeConfiguration, isLoading} =
        useAiAgentStoreConfigurationContext()

    const guidanceHelpCenters = useAppSelector(getHelpCenterGuidanceList)

    const {routes} = useAiAgentNavigation({shopName})

    const guidanceHelpCenter = useMemo(
        () =>
            storeConfiguration
                ? guidanceHelpCenters.find(
                      (helpCenter) =>
                          helpCenter.id ===
                          storeConfiguration.guidanceHelpCenterId
                  )
                : undefined,
        [guidanceHelpCenters, storeConfiguration]
    )

    useEffect(() => {
        if (isLoading) {
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
    }, [guidanceHelpCenter, isLoading, shopName, storeConfiguration])

    if (isLoading) {
        return <Loader data-testid="loader" />
    }

    if (!storeConfiguration || !guidanceHelpCenter) {
        return (
            <AiAgentLayout shopName={shopName} className={css.container}>
                <AutomateViewContent>
                    <Alert icon type={AlertType.Warning}>
                        Please configure your{' '}
                        <Link to={routes.configuration}>
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
