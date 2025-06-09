import cn from 'classnames'

import { isErrorFlag } from '../helpers/isErrorFlag'
import { TicketMessageElement } from '../types'
import { MessageAvatar } from './MessageAvatar'
import { MessageBody } from './MessageBody'
import { MessageContent } from './MessageContent'
import { MessageError } from './MessageError'
import { MessageHeader } from './MessageHeader'
import { MessageMetadata } from './MessageMetadata'

import css from './TicketMessage.less'

type Props = {
    element: TicketMessageElement
}

export function TicketMessage({ element }: Props) {
    const isAI = element.flags?.includes('ai') ?? false
    const isMinimal = element.flags?.includes('minimal') ?? false
    const error = element.flags?.find(isErrorFlag)?.[1]

    const messageMetadata = <MessageMetadata message={element.data} />

    const messageBody = (
        <MessageBody message={element.data} isAI={isAI}>
            <MessageContent
                message={element.data}
                isFailed={Boolean(error)}
                metadata={isMinimal && messageMetadata}
            />
            {error && <MessageError error={error} />}
        </MessageBody>
    )

    return (
        <div
            className={cn(css.container, {
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
                            isAI={element.flags?.includes('ai') ?? false}
                            isFailed={Boolean(error)}
                            message={element.data}
                            messageMetadata={messageMetadata}
                        />
                        {messageBody}
                    </div>
                </>
            )}
        </div>
    )
}
