import {
    ButtonGroup,
    ButtonGroupItem,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { CopyButton } from '../CopyButton/CopyButton'
import { IntentsFeedback } from '../IntentsFeedback/IntentsFeedback'
import { BubbleActions } from '../MessageBubble/components/BubbleActions'

type TicketMessageActionsProps = {
    message: TicketMessage
}

export function TicketMessageActions({ message }: TicketMessageActionsProps) {
    const copyText = message.stripped_text || message.body_text || ''
    return (
        <BubbleActions placement={message.from_agent ? 'left' : 'right'}>
            <ButtonGroup>
                {!message.from_agent && (
                    <ButtonGroupItem
                        id="intents"
                        icon={<IntentsFeedback message={message} />}
                    />
                )}
                <Tooltip
                    trigger={
                        <ButtonGroupItem
                            id="copy"
                            icon={<CopyButton text={copyText} />}
                        />
                    }
                >
                    <TooltipContent title="Copy message" />
                </Tooltip>
            </ButtonGroup>
        </BubbleActions>
    )
}
