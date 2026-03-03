import { OverflowListItem, Text } from '@gorgias/axiom'
import type { TicketCustomerChannel } from '@gorgias/helpdesk-types'

import { FieldRow } from './FieldRow'

import css from '../InfobarCustomerFields.less'

type OtherChannelFieldProps = {
    channel: TicketCustomerChannel
    index: number
    otherChannels: TicketCustomerChannel[]
}

function formatChannelTypeLabel(type: string): string {
    return type
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function OtherChannelField({
    channel,
    index,
    otherChannels,
}: OtherChannelFieldProps) {
    const showLabel =
        index === 0 || otherChannels[index - 1].type !== channel.type
    return (
        <OverflowListItem key={channel.id} className={css.overflowListItem}>
            <FieldRow
                label={showLabel ? formatChannelTypeLabel(channel.type) : null}
            >
                <Text size="md" overflow="ellipsis" className={css.fieldValue}>
                    {channel.address}
                </Text>
            </FieldRow>
        </OverflowListItem>
    )
}
