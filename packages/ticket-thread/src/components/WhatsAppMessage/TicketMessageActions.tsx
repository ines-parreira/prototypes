import {
    ButtonGroup,
    ButtonGroupItem,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { CopyButton } from '../CopyButton/CopyButton'
import { IntentsFeedback } from '../IntentsFeedback/IntentsFeedback'

type TicketMessageActionsProps = {
    message: TicketMessage
    copyText: string
}

export function TicketMessageActions({
    message,
    copyText,
}: TicketMessageActionsProps) {
    return (
        <ButtonGroup>
            {!message.from_agent && (
                <Tooltip
                    trigger={
                        <ButtonGroupItem
                            id="intents"
                            icon={<IntentsFeedback message={message} />}
                        />
                    }
                >
                    <TooltipContent title="Message intent" />
                </Tooltip>
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
    )
}
