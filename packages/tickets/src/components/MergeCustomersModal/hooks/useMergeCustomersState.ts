import { useCallback, useEffect, useMemo, useState } from 'react'

import type { TicketCustomerChannel } from '@gorgias/helpdesk-queries'
import type { Customer } from '@gorgias/helpdesk-types'

export enum CustomerSelection {
    Destination = 'destination',
    Source = 'source',
}

export type CustomerSelectionValue = 'destination' | 'source'

export type MergeCustomersState = {
    selections: {
        name: CustomerSelectionValue
        email: CustomerSelectionValue
        note: CustomerSelectionValue
        meta: CustomerSelectionValue
    }
    selectedChannels: TicketCustomerChannel[]
}

export function getFieldValue<T>(
    selection: CustomerSelectionValue,
    destinationValue: T,
    sourceValue: T,
): T {
    return selection === CustomerSelection.Destination
        ? destinationValue
        : sourceValue
}

function getDefaultSelection(
    destinationValue: unknown,
): CustomerSelectionValue {
    return destinationValue
        ? CustomerSelection.Destination
        : CustomerSelection.Source
}

export function useMergeCustomersState(
    destinationCustomer: Customer,
    sourceCustomer: Customer | null,
    ticketMessageAddresses: Set<string>,
) {
    const initialState = useMemo(() => {
        const destinationChannels = (destinationCustomer.channels ||
            []) as TicketCustomerChannel[]
        const sourceChannels = (sourceCustomer?.channels ||
            []) as TicketCustomerChannel[]

        if (!sourceCustomer) {
            const initialState: MergeCustomersState = {
                selections: {
                    name: CustomerSelection.Destination,
                    email: CustomerSelection.Destination,
                    note: CustomerSelection.Destination,
                    meta: CustomerSelection.Destination,
                },
                selectedChannels: destinationChannels,
            }
            return initialState
        }

        const initialState: MergeCustomersState = {
            selections: {
                name: getDefaultSelection(destinationCustomer.name),
                email: getDefaultSelection(destinationCustomer.email),
                note: getDefaultSelection(destinationCustomer.note),
                meta: getDefaultSelection(destinationCustomer.meta),
            },
            selectedChannels: [...destinationChannels, ...sourceChannels],
        }

        return initialState
    }, [destinationCustomer, sourceCustomer])

    const [state, setState] = useState<MergeCustomersState>(initialState)

    useEffect(() => {
        setState(initialState)
    }, [initialState])

    const selectedPrimaryEmail = useMemo(
        () =>
            getFieldValue(
                state.selections.email,
                destinationCustomer.email || '',
                sourceCustomer?.email || '',
            ),
        [
            state.selections.email,
            destinationCustomer.email,
            sourceCustomer?.email,
        ],
    )

    const requiredAddresses = useMemo(() => {
        const addresses = new Set(ticketMessageAddresses)

        if (selectedPrimaryEmail) {
            addresses.add(selectedPrimaryEmail)
        }

        return addresses
    }, [ticketMessageAddresses, selectedPrimaryEmail])

    useEffect(() => {
        const allChannels = [
            ...(destinationCustomer.channels || []),
            ...(sourceCustomer?.channels || []),
        ] as TicketCustomerChannel[]

        const requiredChannels = allChannels.filter((channel) =>
            requiredAddresses.has(channel.address || ''),
        )

        const currentSelectedIds = new Set(
            state.selectedChannels.map((ch) => ch.id),
        )
        const missingRequiredChannels = requiredChannels.filter(
            (channel) => !currentSelectedIds.has(channel.id),
        )

        if (missingRequiredChannels.length > 0) {
            setState({
                ...state,
                selectedChannels: [
                    ...state.selectedChannels,
                    ...missingRequiredChannels,
                ],
            })
        }
    }, [requiredAddresses, destinationCustomer, sourceCustomer, state])

    const resetState = useCallback(() => {
        setState(initialState)
    }, [initialState])

    return {
        state,
        setState,
        resetState,
        selectedPrimaryEmail,
        requiredAddresses,
    }
}
