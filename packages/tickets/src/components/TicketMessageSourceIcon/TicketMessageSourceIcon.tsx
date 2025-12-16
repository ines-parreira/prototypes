import type { IconProps } from '@gorgias/axiom'
import { Icon } from '@gorgias/axiom'

import type { TicketMessageSource } from './utils'
import { ticketMessageSourceToIconName } from './utils'

type TicketMessageSourceIconProps = Omit<IconProps, 'name'> & {
    source: TicketMessageSource
}

export function TicketMessageSourceIcon({
    source,
    intent = 'regular',
    ...props
}: TicketMessageSourceIconProps) {
    return (
        <Icon
            {...props}
            intent={intent}
            name={ticketMessageSourceToIconName(source)}
        />
    )
}
