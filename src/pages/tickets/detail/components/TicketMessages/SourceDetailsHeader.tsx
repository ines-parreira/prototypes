import React, { useMemo, useState } from 'react'

import classnames from 'classnames'

import { TicketMessage } from '@gorgias/helpdesk-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useMeasure from 'hooks/useMeasure'
import { TicketMessage as TicketMessage_DEPRECATED } from 'models/ticket/types'
import MessageStatusIndicator from 'tickets/ticket-detail/components/MessageStatusIndicator'

import SourceActionsHeader from './SourceActionsHeader'
import SourceDetailsContext from './SourceDetailsContext'
import { SourceDetailsInfo } from './SourceDetailsInfo'

import css from './SourceDetails.less'

type Props = {
    className?: string
    contentClassName?: string
    showMessageStatusIndicator?: boolean
    hideTimestamp?: boolean
    isMessageDeleted?: boolean
    message: TicketMessage_DEPRECATED | TicketMessage
    showIntents?: boolean
}

export default function SourceDetailsHeader({
    className,
    contentClassName,
    showMessageStatusIndicator = true,
    hideTimestamp = false,
    isMessageDeleted,
    message,
    showIntents = true,
}: Props) {
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
    const [focus, setFocus] = useState(false)

    const [ref, { width }] = useMeasure()
    const debouncedWidth = useDebouncedValue(width, 300)

    const actionHeader = useMemo(() => {
        const collapseActions = debouncedWidth < 400
        const collapseIntents = debouncedWidth < 300

        if (!isMessageDeleted) {
            return (
                <SourceDetailsContext.Provider value={{ setFocus }}>
                    <SourceActionsHeader
                        showIntents={showIntents}
                        message={message as TicketMessage_DEPRECATED}
                        collapseActions={collapseActions}
                        collapseIntents={collapseIntents}
                    />
                </SourceDetailsContext.Provider>
            )
        }

        return null
    }, [isMessageDeleted, message, debouncedWidth, showIntents])

    const meta = message.meta as TicketMessage_DEPRECATED['meta']

    return (
        <div
            className={classnames(css.wrapper, className)}
            data-focus={focus}
            ref={ref as React.LegacyRef<HTMLDivElement>}
        >
            <div className={classnames(css.content, contentClassName)}>
                {actionHeader}
                {!hasTicketThreadRevamp && (
                    <>
                        {showMessageStatusIndicator && (
                            <MessageStatusIndicator
                                message={message as TicketMessage}
                            />
                        )}
                        <SourceDetailsInfo
                            datetime={message.created_datetime}
                            hideTimestamp={hideTimestamp}
                            meta={meta ?? undefined}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
