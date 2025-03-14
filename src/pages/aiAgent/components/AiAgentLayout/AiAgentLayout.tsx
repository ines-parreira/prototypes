import React, { ReactNode, useMemo } from 'react'

import classnames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { useLocation } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useAccountStoreConfiguration } from 'pages/aiAgent/hooks/useAccountStoreConfiguration'
import { getAiAgentBasePath } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'

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
}

export const AiAgentLayout = ({
    shopName,
    className,
    children,
    title,
    isLoading,
    hideViewAiAgentTicketsButton,
}: Props) => {
    const headerNavbarItems = useAiAgentHeaderNavbarItems(shopName)

    const { aiAgentTicketViewId } = useAccountStoreConfiguration({
        storeNames: [shopName],
    })

    // For tracking purpose in activation feature, we need to pass the page path
    const flags = useFlags()
    const basePath = getAiAgentBasePath(shopName, flags)
    const currentPagePath = useLocation().pathname.replace(`${basePath}/`, '')

    const { ActivationModal, EarlyAccessModal, ActivationButton } =
        useActivation(currentPagePath)

    const AiAgentTitle = useMemo(() => {
        return (
            <div className={css.customAiAgentTitle}>
                <div className={css.customAiAgentTitleSubContainer}>
                    <h1 className="d-flex align-items-center">{title}</h1>
                    {!hideViewAiAgentTicketsButton && aiAgentTicketViewId && (
                        <Button
                            size="small"
                            intent="secondary"
                            onClick={() => {
                                logEvent(SegmentEvent.AiAgentViewTicketsClicked)
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
                <div>
                    <ActivationButton />
                </div>
            </div>
        )
    }, [
        hideViewAiAgentTicketsButton,
        aiAgentTicketViewId,
        title,
        ActivationButton,
    ])

    return (
        <AiAgentView
            isLoading={isLoading}
            title={AiAgentTitle}
            headerNavbarItems={headerNavbarItems}
            className={classnames(css.container, className)}
        >
            {children}
            <ActivationModal />
            <EarlyAccessModal />
        </AiAgentView>
    )
}
