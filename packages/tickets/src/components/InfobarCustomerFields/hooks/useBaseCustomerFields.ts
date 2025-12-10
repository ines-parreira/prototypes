import { useCallback } from 'react'

import type {
    TicketCustomerChannel,
    UpdateCustomerBodyChannelsItem,
} from '@gorgias/helpdesk-queries'

import { useGetTicketData } from '../../InfobarTicketDetails/components/InfobarTicketDetailsTags/hooks/useGetTicketData'
import { useUpdateCustomer } from './useUpdateCustomer'

export function useBaseCustomerFields(ticketId: string) {
    const { data: ticket } = useGetTicketData(ticketId)
    const customer = ticket?.data?.customer

    const { updateCustomer } = useUpdateCustomer(ticketId, customer?.id ?? 0)

    const handleNoteChange = useCallback(
        async (value: string) => {
            await updateCustomer({ note: value })
        },
        [updateCustomer],
    )

    const handleChannelChange = useCallback(
        async (
            channelId: number | null,
            channelType: 'email' | 'phone',
            newAddress: string,
        ) => {
            if (!customer) return

            let updatedChannels

            if (channelId === null) {
                updatedChannels = [
                    ...customer.channels,
                    {
                        address: newAddress,
                        type: channelType,
                        preferred: false,
                    },
                ]
            } else {
                updatedChannels =
                    customer.channels?.reduce(
                        (
                            acc: TicketCustomerChannel[],
                            channel: TicketCustomerChannel,
                        ) => {
                            if (channel.id === channelId) {
                                if (newAddress && !!newAddress.trim()) {
                                    acc.push({
                                        ...channel,
                                        address: newAddress,
                                    })
                                }
                            } else {
                                acc.push(channel)
                            }
                            return acc
                        },
                        [],
                    ) || []
            }

            await updateCustomer({
                channels: updatedChannels as UpdateCustomerBodyChannelsItem[],
            })
        },
        [customer, updateCustomer],
    )

    return {
        customer,
        handleNoteChange,
        handleChannelChange,
    }
}
