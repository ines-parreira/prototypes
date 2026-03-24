import { useEffect, useMemo } from 'react'

import { reportError } from '@repo/logging'
import { Link, useParams } from 'react-router-dom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'

import { AiAgentGuidanceView } from './AiAgentGuidanceView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { KNOWLEDGE } from './constants'
import { useAiAgentNavigation } from './hooks/useAiAgentNavigation'

import css from './AiAgentGuidanceContainer.less'

export const AiAgentGuidanceContainer = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

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
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
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
                title={KNOWLEDGE}
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
            title={KNOWLEDGE}
            isLoading={isStoreConfigLoading || isLoadingHelpCenters}
        >
            <AiAgentGuidanceView
                helpCenterId={guidanceHelpCenter.id}
                shopName={shopName}
                shopType={shopType}
                locale={guidanceHelpCenter.default_locale}
            />
        </AiAgentLayout>
    )
}
