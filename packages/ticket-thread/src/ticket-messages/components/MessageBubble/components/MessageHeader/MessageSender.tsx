import { OverflowTooltip, Text } from '@gorgias/axiom'
import type { TicketMessageUserOrCustomer } from '@gorgias/helpdesk-types'

import css from './MessageSender.less'

export type MessageSenderProps = {
    sender: Partial<Pick<TicketMessageUserOrCustomer, 'name' | 'email' | 'id'>>
    email?: string | null
}

export function MessageSender({ sender, email }: MessageSenderProps) {
    const name = sender.name ?? sender.email ?? `Customer #${sender.id}`

    return (
        <div className={css.container}>
            <div className={email ? css.nameSlotWithEmail : css.nameSlot}>
                <OverflowTooltip delay={0}>
                    <Text
                        size="md"
                        variant="bold"
                        overflow="ellipsis"
                        className={css.truncate}
                    >
                        {name}
                    </Text>
                </OverflowTooltip>
            </div>
            {email && (
                <div className={css.emailSlot}>
                    <OverflowTooltip delay={0}>
                        <Text
                            size="md"
                            color="content-neutral-tertiary"
                            overflow="ellipsis"
                            className={css.truncate}
                        >
                            {`<${email}>`}
                        </Text>
                    </OverflowTooltip>
                </div>
            )}
        </div>
    )
}
