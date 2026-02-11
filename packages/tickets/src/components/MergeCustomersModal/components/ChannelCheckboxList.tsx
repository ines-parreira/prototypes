import { Box, RadioCard, RadioGroup, Text } from '@gorgias/axiom'
import type { TicketCustomerChannel } from '@gorgias/helpdesk-queries'

import { formatPhoneNumberInternational } from '../../../utils/validation'

import css from '../MergeCustomersModal.less'

type ChannelCheckboxListProps = {
    channels: TicketCustomerChannel[]
    selectedChannels: TicketCustomerChannel[]
    onToggle: (channel: TicketCustomerChannel) => void
    label: string
    disabledChannelAddresses?: Set<string>
}

export function ChannelCheckboxList({
    channels,
    selectedChannels,
    onToggle,
    label,
    disabledChannelAddresses,
}: ChannelCheckboxListProps) {
    const formatChannelAddress = (channel: TicketCustomerChannel) => {
        if (channel.type === 'phone' || channel.type === 'sms') {
            return formatPhoneNumberInternational(channel.address || '')
        }
        return channel.address || ''
    }

    if (channels.length === 0) {
        return null
    }

    return (
        <Box flexDirection="column" gap="xs" width="100%">
            {channels.map((channel) => {
                const isSelected = selectedChannels.some(
                    (c) => c.id === channel.id,
                )
                const isDisabled = Boolean(
                    disabledChannelAddresses?.has(channel.address || ''),
                )

                return (
                    <Box key={channel.id} width="100%">
                        <RadioGroup
                            value={isSelected ? 'selected' : 'unselected'}
                            isDisabled={isDisabled}
                            className={css.radioGroup}
                        >
                            <RadioCard
                                //@ts-ignore - this allows "unselection" - however it is not native HTML behaviour
                                // and should be addressed at Axiom level with a potential checkbox-based component
                                onClick={() => !isDisabled && onToggle(channel)}
                                value="selected"
                                title={label}
                            >
                                <Text
                                    size="sm"
                                    className={css.cardSubtext}
                                    overflow="ellipsis"
                                >
                                    {formatChannelAddress(channel)}
                                </Text>
                            </RadioCard>
                        </RadioGroup>
                    </Box>
                )
            })}
        </Box>
    )
}
