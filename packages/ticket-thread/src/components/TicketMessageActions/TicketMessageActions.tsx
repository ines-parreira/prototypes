import { useRef } from 'react'

import { useCopyToClipboard } from '@gorgias/toolkit-react'

import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { CopyButton } from '../CopyButton/CopyButton'
import { IntentsFeedback } from '../IntentsFeedback/IntentsFeedback'
import type { IntentsFeedbackHandle } from '../IntentsFeedback/IntentsFeedback'
import type { BubbleActionItem } from '../MessageBubble/components/BubbleActions'
import { BubbleActions } from '../MessageBubble/components/BubbleActions'

type TicketMessageActionsProps = {
    message: TicketMessage
}

export function TicketMessageActions({ message }: TicketMessageActionsProps) {
    const copyText = message.stripped_text || message.body_text || ''
    const [, copyToClipboard] = useCopyToClipboard()
    const intentsFeedbackRef = useRef<IntentsFeedbackHandle>(null)

    const intentsItem: BubbleActionItem = {
        id: 'intents',
        icon: <IntentsFeedback message={message} />,
        compactLabel: 'Intents',
        compactLeadingSlot: 'folder-document',
        onAction: () => intentsFeedbackRef.current?.open(),
        compactAnchor: (
            <IntentsFeedback ref={intentsFeedbackRef} message={message} />
        ),
    }

    const items: BubbleActionItem[] = [
        ...(!message.from_agent ? [intentsItem] : []),
        {
            id: 'copy',
            icon: <CopyButton text={copyText} />,
            tooltip: 'Copy message',
            compactLabel: 'Copy message',
            compactLeadingSlot: 'copy',
            onAction: () => copyToClipboard(copyText),
        },
    ]

    return (
        <BubbleActions
            placement={message.from_agent ? 'left' : 'right'}
            items={items}
        />
    )
}
