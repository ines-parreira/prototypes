import { useCallback } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import type { TicketPurpose } from 'state/billing/types'
import { notify } from 'state/notifications/actions'

import createBillingErrorNotification from '../utils/createBillingErrorNotification'

type ContactBilling = (ticketPurpose: TicketPurpose) => void

const useDispatchBillingError = (contactBilling: ContactBilling) => {
    const dispatch = useAppDispatch()

    return useCallback(
        (error: unknown) => {
            void dispatch(
                notify(createBillingErrorNotification(error, contactBilling)),
            )
        },
        [contactBilling, dispatch],
    )
}

export default useDispatchBillingError
