import { useRef } from 'react'

import { isErrorFlag } from '../helpers/isErrorFlag'
import { TicketMessageElement } from '../types'
import { MessageBody } from './MessageBody'
import { MessageContent } from './MessageContent'
import { MessageError } from './MessageError'
import { MessageHeader } from './MessageHeader'

import css from './TicketMessage.less'

type Props = {
    element: TicketMessageElement
}

export function TicketMessage({ element }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const isAI = element.flags?.includes('ai') ?? false
    const isMinimal = element.flags?.includes('minimal') ?? false
    const error = element.flags?.find(isErrorFlag)?.[1]

    return (
        <div className={css.container} ref={containerRef}>
            {!isMinimal && (
                <MessageHeader
                    isAI={element.flags?.includes('ai') ?? false}
                    isFailed={Boolean(error)}
                    message={element.data}
                    containerRef={containerRef}
                />
            )}
            <MessageBody message={element.data} isAI={isAI}>
                <MessageContent
                    message={element.data}
                    isFailed={Boolean(error)}
                />
                {error && <MessageError error={error} />}
            </MessageBody>
        </div>
    )
}
