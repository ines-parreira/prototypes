import React, { ReactNode, useMemo } from 'react'

import classnames from 'classnames'

import { logEvent, SegmentEvent } from 'common/segment'
import { useAccountStoreConfiguration } from 'pages/aiAgent/hooks/useAccountStoreConfiguration'
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
            </div>
        )
    }, [hideViewAiAgentTicketsButton, aiAgentTicketViewId, title])

    return (
        <AiAgentView
            isLoading={isLoading}
            title={AiAgentTitle}
            headerNavbarItems={headerNavbarItems}
            className={classnames(css.container, className)}
        >
            {children}
        </AiAgentView>
    )
}
