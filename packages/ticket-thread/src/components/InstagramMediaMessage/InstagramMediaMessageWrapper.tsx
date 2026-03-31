import {
    ButtonGroup,
    ButtonGroupItem,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import type { TicketThreadSocialMediaInstagramMediaItem } from '../../hooks/messages/types'
import { CopyButton } from '../CopyButton/CopyButton'
import { IntentsFeedback } from '../IntentsFeedback/IntentsFeedback'
import { InstagramMediaMessage } from './InstagramMediaMessage'

type InstagramMediaMessageWrapperProps = {
    item: TicketThreadSocialMediaInstagramMediaItem
}

export function InstagramMediaMessageWrapper({
    item,
}: InstagramMediaMessageWrapperProps) {
    const fromAgent = item.data.from_agent ?? false
    const copyText = item.data.stripped_text || item.data.body_text || ''

    const actions = (
        <ButtonGroup>
            {!fromAgent && (
                <Tooltip
                    trigger={
                        <ButtonGroupItem
                            id="intents"
                            icon={<IntentsFeedback message={item.data} />}
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

    return <InstagramMediaMessage item={item} actions={actions} />
}
