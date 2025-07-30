import { ReactNode, useMemo } from 'react'

import classnames from 'classnames'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useAccountStoreConfiguration } from 'pages/aiAgent/hooks/useAccountStoreConfiguration'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentView } from '../AiAgentView/AiAgentView'
import { useAiAgentHeaderNavbarItems } from './useAiAgentHeaderNavbarItems'

import css from './AiAgentLayout.less'

type Props = {
    children?: ReactNode
    shopName: string
    className?: string
    title: ReactNode
    isLoading?: boolean
    hideViewAiAgentTicketsButton?: boolean
    // Hide title and navbar (eg: to show a paywall)
    fullscreen?: boolean
}

export const AiAgentLayout = ({
    shopName,
    className,
    children,
    title,
    isLoading,
    hideViewAiAgentTicketsButton,
    fullscreen,
}: Props) => {
    const isActionDrivenAiAgentNavigationEnabled = useFlag(
        FeatureFlagKey.ActionDrivenAiAgentNavigation,
    )
    const headerNavbarItems = useAiAgentHeaderNavbarItems(shopName)

    const { aiAgentTicketViewId } = useAccountStoreConfiguration({
        storeNames: [shopName],
    })
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const atLeastOneStoreHasActiveTrial = useAtLeastOneStoreHasActiveTrial()

    const { storeActivations } = useStoreActivations()

    const { canStartTrial, canStartTrialFromFeatureFlag } =
        useActivateAiAgentTrial({
            accountDomain,
            storeActivations,
            onSuccess: () => {},
        })

    const { activationModal, earlyAccessModal, activationButton } =
        useActivation({
            autoDisplayEarlyAccessDisabled:
                atLeastOneStoreHasActiveTrial ||
                canStartTrial ||
                canStartTrialFromFeatureFlag,
        })

    const AiAgentTitle = useMemo(() => {
        return (
            <div className={css.customAiAgentTitle}>
                <div className={css.customAiAgentTitleSubContainer}>
                    <h1 className="d-flex align-items-center">{title}</h1>
                    {!isActionDrivenAiAgentNavigationEnabled &&
                        !hideViewAiAgentTicketsButton &&
                        aiAgentTicketViewId && (
                            <Button
                                size="small"
                                intent="secondary"
                                onClick={() => {
                                    logEvent(
                                        SegmentEvent.AiAgentViewTicketsClicked,
                                    )
                                    history.push(
                                        `/app/views/${aiAgentTicketViewId}`,
                                        {
                                            skipRedirect: true,
                                        },
                                    )
                                }}
                            >
                                View AI Agent Tickets
                            </Button>
                        )}
                </div>
                <div>{activationButton}</div>
            </div>
        )
    }, [
        hideViewAiAgentTicketsButton,
        aiAgentTicketViewId,
        title,
        activationButton,
        isActionDrivenAiAgentNavigationEnabled,
    ])

    return (
        <AiAgentView
            isLoading={isLoading}
            title={!fullscreen ? AiAgentTitle : undefined}
            headerNavbarItems={!fullscreen ? headerNavbarItems : undefined}
            className={classnames(css.container, className)}
        >
            {children}
            {activationModal}
            {earlyAccessModal}
        </AiAgentView>
    )
}
