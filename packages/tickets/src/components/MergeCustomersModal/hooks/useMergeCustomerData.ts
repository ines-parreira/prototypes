import { useMemo } from 'react'

import isEmpty from 'lodash/isEmpty'

import type { TicketCustomerChannel } from '@gorgias/helpdesk-queries'
import type { Customer } from '@gorgias/helpdesk-types'

import { separateChannelsByType } from '../utils/separateChannelsByType'

interface UseMergeCustomerDataProps {
    destinationCustomer: Customer
    sourceCustomer: Customer | null
}

export function useMergeCustomerData({
    destinationCustomer,
    sourceCustomer,
}: UseMergeCustomerDataProps) {
    const destinationChannels = useMemo(
        () => (destinationCustomer.channels || []) as TicketCustomerChannel[],
        [destinationCustomer.channels],
    )

    const sourceChannels = useMemo(
        () => (sourceCustomer?.channels || []) as TicketCustomerChannel[],
        [sourceCustomer],
    )

    const {
        emailChannels: destinationEmailChannels,
        integrationsByType: destinationIntegrationsByType,
    } = useMemo(
        () => separateChannelsByType(destinationChannels),
        [destinationChannels],
    )

    const {
        emailChannels: sourceEmailChannels,
        integrationsByType: sourceIntegrationsByType,
    } = useMemo(() => separateChannelsByType(sourceChannels), [sourceChannels])

    const integrationTypes = useMemo(
        () =>
            Object.keys({
                ...destinationIntegrationsByType,
                ...sourceIntegrationsByType,
            }),
        [destinationIntegrationsByType, sourceIntegrationsByType],
    )

    const hasNoName = useMemo(
        () => !destinationCustomer.name && !sourceCustomer?.name,
        [destinationCustomer.name, sourceCustomer?.name],
    )

    const hasNoPrimaryEmail = useMemo(
        () => !destinationCustomer.email && !sourceCustomer?.email,
        [destinationCustomer.email, sourceCustomer?.email],
    )

    const hasNoNote = useMemo(
        () => !destinationCustomer.note && !sourceCustomer?.note,
        [destinationCustomer.note, sourceCustomer?.note],
    )

    const hasNoData = useMemo(
        () =>
            isEmpty(destinationCustomer.meta) && isEmpty(sourceCustomer?.meta),
        [destinationCustomer.meta, sourceCustomer?.meta],
    )

    return {
        destinationEmailChannels,
        destinationIntegrationsByType,
        sourceEmailChannels,
        sourceIntegrationsByType,
        integrationTypes,
        hasNoName,
        hasNoPrimaryEmail,
        hasNoNote,
        hasNoData,
    }
}
