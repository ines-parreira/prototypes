import cn from 'classnames'

import {
    isTicketMessageDeleted,
    isTicketMessageHidden,
} from 'models/ticket/predicates'
import { useSmartFollowUps } from 'pages/tickets/detail/components/TicketMessages/hooks/useSmartFollowUps'
import SmartFollowUps from 'pages/tickets/detail/components/TicketMessages/SmartFollowUps'
import { useTicketModalContext } from 'timeline/ticket-modal/hooks/useTicketModalContext'

import { isErrorFlag } from '../helpers/isErrorFlag'
import type { TicketMessageElement } from '../types'
import { MessageAvatar } from './MessageAvatar'
import { MessageBody } from './MessageBody'
import { MessageContent } from './MessageContent'
import { MessageError } from './MessageError'
import { MessageHeader } from './MessageHeader'

import css from './TicketMessage.less'

type Props = {
    element: TicketMessageElement
}

export function TicketMessage({ element }: Props) {
    const isAI = element.flags?.includes('ai') ?? false
    const isMinimal = element.flags?.includes('minimal') ?? false
    const error = element.flags?.find(isErrorFlag)?.[1]
    const { isInsideSidePanel } = useTicketModalContext()

    const {
        smartFollowUps,
        selectedSmartFollowUpIndex,
        shouldRenderMessageContent,
        shouldRenderSmartFollowUps,
    } = useSmartFollowUps(element.data.meta)

    const messageBody = (
        <MessageBody message={element.data} isAI={isAI}>
            {shouldRenderMessageContent && (
                <MessageContent
                    message={element.data}
                    isFailed={Boolean(error)}
                />
            )}
            {shouldRenderSmartFollowUps && (
                <SmartFollowUps
                    smartFollowUps={smartFollowUps}
                    selectedSmartFollowUpIndex={selectedSmartFollowUpIndex}
                />
            )}
            {error && <MessageError error={error} />}
        </MessageBody>
    )

    return (
        <div
            className={cn(css.container, {
                [css.sidePanel]: isInsideSidePanel,
                [css.minimal]: isMinimal,
                [css.internal]: !isAI && !element.data.public,
                [css.ai]: isAI,
            })}
        >
            {isMinimal ? (
                <div className={css.minimalBodyContainer}>{messageBody}</div>
            ) : (
                <>
                    <MessageAvatar
                        message={element.data}
                        isAI={isAI}
                        isFailed={Boolean(error)}
                    />
                    <div className={css.headerContainer}>
                        <MessageHeader
                            message={element.data}
                            isFailed={Boolean(error)}
                            isMessageDeleted={isTicketMessageDeleted(
                                element.data,
                            )}
                            isMessageHidden={isTicketMessageHidden(
                                element.data,
                            )}
                            isAI={isAI}
                            readonly
                        />
                        {messageBody}
                    </div>
                </>
            )}
        </div>
    )
}
