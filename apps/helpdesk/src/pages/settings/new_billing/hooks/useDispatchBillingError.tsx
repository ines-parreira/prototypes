import { useCallback } from 'react'

import { Button, toast } from '@gorgias/axiom'

import { isGorgiasApiError } from 'models/api/types'
import { TicketPurpose } from 'state/billing/types'

type ContactBilling = (ticketPurpose: TicketPurpose) => void

const useDispatchBillingError = (contactBilling: ContactBilling) => {
    return useCallback(
        (error: unknown) => {
            const apiError = isGorgiasApiError(error) ? error : undefined
            const errorMsg = apiError
                ? apiError.response.data.error.msg
                : `We couldn't update your subscription. Please try again.`

            toast.error(errorMsg, {
                id: 'billing-error-notification',
                duration: Infinity,
                inlineActions: (
                    <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => contactBilling(TicketPurpose.ERROR)}
                    >
                        Contact Billing
                    </Button>
                ),
            })
        },
        [contactBilling],
    )
}

export { useDispatchBillingError }
