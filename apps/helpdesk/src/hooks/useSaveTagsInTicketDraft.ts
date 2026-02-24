import { useCallback, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import type { Order } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getIntegrationsData, getTicketCustomer } from 'state/ticket/selectors'

import { mergeCustomer } from '../state/ticket/actions'

export default function useSaveTagsInTicketDraft(
    data_source: 'Customer' | 'Order' | null,
    integrationId: number | null,
    orderId?: number | null,
) {
    const { ticketId: ticketIdParam } = useParams<{ ticketId: string }>()
    const dispatch = useAppDispatch()
    const integrationsImmutable = useAppSelector(getIntegrationsData)
    const currentCustomerImmutable = useAppSelector(getTicketCustomer)
    const isTicketNew = useMemo(() => ticketIdParam === 'new', [ticketIdParam])

    const saveTagsInDraft = useCallback(
        (tagsListStr: string) => {
            if (!isTicketNew || !integrationId || !data_source) {
                return
            }

            const integrations = integrationsImmutable.toJS()
            const currentCustomer = currentCustomerImmutable.toJS()
            const selectedIntegration = integrations[integrationId]

            if (!selectedIntegration) {
                return
            }

            const updatedCustomer = {
                ...currentCustomer,
                integrations: {
                    ...integrations,
                    [integrationId]: {
                        ...selectedIntegration,
                        ...(data_source === 'Customer' && {
                            customer: {
                                ...selectedIntegration.customer,
                                tags: tagsListStr,
                            },
                        }),
                        ...(data_source === 'Order' &&
                            orderId && {
                                orders: (selectedIntegration.orders || []).map(
                                    (order: Order) =>
                                        order.id === orderId
                                            ? { ...order, tags: tagsListStr }
                                            : order,
                                ),
                            }),
                    },
                },
            }

            dispatch(mergeCustomer(updatedCustomer))
        },
        [
            isTicketNew,
            integrationId,
            integrationsImmutable,
            currentCustomerImmutable,
            dispatch,
            data_source,
            orderId,
        ],
    )

    return { saveTagsInDraft }
}
