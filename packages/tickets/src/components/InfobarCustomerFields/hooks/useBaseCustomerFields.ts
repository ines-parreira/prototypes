import { useCallback, useState } from 'react'

import type {
    TicketCustomer,
    TicketCustomerChannel,
    UpdateCustomerBodyChannelsItem,
} from '@gorgias/helpdesk-queries'

import { useCustomerChannels } from './useCustomerChannels'
import { useUpdateCustomer } from './useUpdateCustomer'

type ChannelType = 'email' | 'phone'

type BaseCustomerFieldsEmptyFields = Record<ChannelType, string>

type BaseCustomerFieldsParams = {
    ticketId: string
    customer: TicketCustomer
}
export function useBaseCustomerFields({
    ticketId,
    customer,
}: BaseCustomerFieldsParams) {
    const [note, setNote] = useState<string>(customer.note ?? '')
    const [fields, setFields] = useState<BaseCustomerFieldsEmptyFields>({
        phone: '',
        email: '',
    })
    const [channels, setChannels] = useState<TicketCustomerChannel[]>(
        customer.channels ?? [],
    )

    const sortedChannels = useCustomerChannels(channels)

    const { updateCustomer } = useUpdateCustomer(ticketId, customer?.id ?? 0)

    const handleNoteBlur = useCallback(
        async (value: string) => {
            setNote(value)
            await updateCustomer({ note: value })
        },
        [updateCustomer],
    )

    const updateChannels = useCallback(
        (channelId: number, address: string) =>
            channels.map((channel) => {
                if (channel.id === channelId) {
                    return {
                        ...channel,
                        address,
                    }
                }
                return channel
            }),
        [channels],
    )

    const handleChannelChange = useCallback(
        async (channelId: number, address: string) => {
            const updatedChannels = updateChannels(channelId, address)
            setChannels(updatedChannels)
        },
        [updateChannels],
    )

    const createChannel = useCallback(
        async (type: ChannelType, address: string) => {
            if (address.trim().length === 0) {
                return
            }
            const updatedChannels = [
                ...channels,
                {
                    address,
                    type,
                    preferred: false,
                } as TicketCustomerChannel,
            ]
            setChannels(updatedChannels)
            await updateCustomer({
                channels: updatedChannels as UpdateCustomerBodyChannelsItem[],
            })
            setFields((prevFields) => ({
                ...prevFields,
                [type]: '',
            }))
        },
        [channels, updateCustomer, setFields],
    )

    const updateChannel = useCallback(
        async (channelId: number, address: string) => {
            const updatedChannels = updateChannels(channelId, address)
            setChannels(updatedChannels)
            await updateCustomer({
                channels: updatedChannels as UpdateCustomerBodyChannelsItem[],
            })
        },
        [updateCustomer, updateChannels],
    )

    const deleteChannel = useCallback(
        async (channelId: number) => {
            const updatedChannels = channels.filter(
                (channel) => channel.id !== channelId,
            )
            setChannels(updatedChannels)
            await updateCustomer({
                channels: updatedChannels as UpdateCustomerBodyChannelsItem[],
            })
        },
        [channels, updateCustomer],
    )

    return {
        ...sortedChannels,
        note,
        setNote,
        handleNoteBlur,
        fields,
        setFields,
        handleChannelChange,
        createChannel,
        updateChannel,
        deleteChannel,
    }
}
