import { useEffect, useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { Link, useParams } from 'react-router-dom'

import { AI_AGENT_SENTRY_TEAM } from 'common/const/sentryTeamNames'
import { FeatureFlagKey } from 'config/featureFlags'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { reportError } from 'utils/errors'

import { AiAgentGuidanceView } from './AiAgentGuidanceView'
import PostCompletionWizardModal from './AiAgentOnboardingWizard/PostCompletionWizardModal'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { AI_AGENT, KNOWLEDGE } from './constants'
import { useAiAgentNavigation } from './hooks/useAiAgentNavigation'

import css from './AiAgentGuidanceContainer.less'

export const AiAgentGuidanceContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const { storeConfiguration, isLoading: isStoreConfigLoading } =
        useAiAgentStoreConfigurationContext()

    const { data: helpCenterListData, isLoading: isLoadingHelpCenters } =
        useGetHelpCenterList(
            { type: 'guidance', per_page: HELP_CENTER_MAX_CREATION },
            {
                staleTime: 1000 * 60 * 5,
            },
        )

    const { routes } = useAiAgentNavigation({ shopName })

    const guidanceHelpCenter = useMemo(
        () =>
            storeConfiguration
                ? (helpCenterListData?.data.data ?? []).find(
                      (helpCenter) =>
                          helpCenter.id ===
                          storeConfiguration.guidanceHelpCenterId,
                  )
                : undefined,
        [helpCenterListData, storeConfiguration],
    )

    useEffect(() => {
        if (isStoreConfigLoading || isLoadingHelpCenters) {
            return
        }

        if (storeConfiguration && !guidanceHelpCenter) {
            reportError(
                new Error(
                    `Can't find help center with id ${storeConfiguration.guidanceHelpCenterId} and store ${shopName}`,
                ),
                {
                    tags: { team: AI_AGENT_SENTRY_TEAM },
                    level: 'error',
                },
            )
        }
    }, [
        guidanceHelpCenter,
        isStoreConfigLoading,
        isLoadingHelpCenters,
        shopName,
        storeConfiguration,
    ])

    if (!storeConfiguration || !guidanceHelpCenter) {
        return (
            <AiAgentLayout
                shopName={shopName}
                className={css.container}
                title={isStandaloneMenuEnabled ? KNOWLEDGE : AI_AGENT}
                isLoading={isStoreConfigLoading || isLoadingHelpCenters}
            >
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
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={isStandaloneMenuEnabled ? KNOWLEDGE : AI_AGENT}
            isLoading={isStoreConfigLoading || isLoadingHelpCenters}
        >
            <AiAgentGuidanceView
                helpCenterId={guidanceHelpCenter.id}
                shopName={shopName}
                locale={guidanceHelpCenter.default_locale}
            />
            <PostCompletionWizardModal />
        </AiAgentLayout>
    )
}
