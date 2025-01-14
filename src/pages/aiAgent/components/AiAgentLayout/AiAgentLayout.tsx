import classnames from 'classnames'
import React, {ReactNode, useMemo} from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import {useAccountStoreConfiguration} from 'pages/aiAgent/hooks/useAccountStoreConfiguration'
import Button from 'pages/common/components/button/Button'

import history from 'pages/history'

import {AiAgentView} from '../AiAgentView/AiAgentView'
import css from './AiAgentLayout.less'
import {useAiAgentHeaderNavbarItems} from './useAiAgentHeaderNavbarItems'

type Props = {
    children?: ReactNode
    shopName: string
    className?: string
    title: ReactNode
    isLoading?: boolean
}

export const AiAgentLayout = ({
    shopName,
    className,
    children,
    title,
    isLoading,
}: Props) => {
    const headerNavbarItems = useAiAgentHeaderNavbarItems(shopName)

    const {aiAgentTicketViewId} = useAccountStoreConfiguration({
        storeNames: [shopName],
    })

    const AiAgentTitle = useMemo(() => {
        return (
            <div className={css.customAiAgentTitle}>
                <h1 className="d-flex align-items-center">{title}</h1>
                {aiAgentTicketViewId && (
                    <Button
                        size="small"
                        intent="secondary"
                        onClick={() => {
                            logEvent(SegmentEvent.AiAgentViewTicketsClicked)
                            history.push(`/app/views/${aiAgentTicketViewId}`, {
                                skipRedirect: true,
                            })
                        }}
                    >
                        View AI Agent Tickets
                    </Button>
                )}
            </div>
        )
    }, [aiAgentTicketViewId, title])

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
