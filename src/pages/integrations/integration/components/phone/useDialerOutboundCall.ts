import {parsePhoneNumber} from 'libphonenumber-js'

import {useOutboundCall} from 'hooks/integrations/phone/useOutboundCall'
import useAppSelector from 'hooks/useAppSelector'
import {PhoneIntegration} from 'models/integration/types'
import {UserSearchResult} from 'models/search/types'
import {getCurrentUserId} from 'state/currentUser/selectors'
import {getTicket} from 'state/ticket/selectors'

import usePhoneNumbers from './usePhoneNumbers'

export default function useDialerOutboundCall({
    inputValue,
    selectedCustomer,
    selectedIntegration,
}: {
    inputValue: string
    selectedCustomer: UserSearchResult | null
    selectedIntegration: PhoneIntegration
}) {
    const makeOutboundCall = useOutboundCall()
    const currentAgentId = useAppSelector(getCurrentUserId)
    const {getPhoneNumberById} = usePhoneNumbers()
    const ticket = useAppSelector(getTicket)

    const selectedIntegrationPhoneNumber = getPhoneNumberById(
        selectedIntegration.meta.phone_number_id
    )

    const makeCall = () => {
        const unformattedPhoneNumber = selectedCustomer?.address ?? inputValue
        const toAddress =
            parsePhoneNumber(unformattedPhoneNumber)?.format('E.164') || ''

        return makeOutboundCall({
            agentId: currentAgentId,
            customerName: selectedCustomer?.customer.name ?? '',
            fromAddress: selectedIntegrationPhoneNumber.phone_number,
            integrationId: selectedIntegration.id,
            ticketId: ticket?.id,
            toAddress,
        })
    }

    return makeCall
}
