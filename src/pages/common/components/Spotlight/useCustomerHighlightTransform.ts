import {useMemo} from 'react'
import {Customer} from 'models/customer/types'
import {TicketChannel} from 'business/types/ticket'
import {CustomerHighlights, PickedCustomer} from './SpotlightCustomerRow'

export type NormalizedCustomerHighlights = {
    email?: string
    name?: string
    order_ids?: string
    'channels.address'?: string
}

export const useCustomerHighlightTransform = (
    highlight: CustomerHighlights,
    item: Customer | PickedCustomer
) => {
    const phoneNumber = useMemo(
        () =>
            item.channels.find(
                (channel) => channel.type === TicketChannel.Phone
            )?.address,
        [item.channels]
    )

    const itemWithHighlights = useMemo(() => {
        const highlightItemsWithValuesAsStrings:
            | NormalizedCustomerHighlights
            | undefined = Object.entries(highlight)
            .map(([key, value]) =>
                value?.[0]
                    ? {
                          [key]: value?.[0],
                      }
                    : undefined
            )
            .filter((item) => Boolean(item))
            .reduce((acc, item) => ({...acc, ...item}), {})
        return {
            ...item,
            ...highlightItemsWithValuesAsStrings,
        }
    }, [highlight, item])

    const phoneNumberOrAddress =
        itemWithHighlights['channels.address'] || phoneNumber

    return {itemWithHighlights, phoneNumberOrAddress}
}
