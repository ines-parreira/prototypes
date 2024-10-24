import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import useAppSelector from 'hooks/useAppSelector'
import {useGetAgent} from 'models/agents/queries'
import {useGetCustomer} from 'models/customer/queries'
import {Customer} from 'models/customer/types'
import {getTicketCustomer} from 'state/ticket/selectors'

export function useCustomerDetails({
    customerId,
    isEnabled = true,
}: {
    customerId: number
    isEnabled?: boolean
}) {
    const ticketCustomer: Customer | undefined =
        useAppSelector(getTicketCustomer)?.toJS()
    const isCallCustomerSameAsTicketCustomer = customerId === ticketCustomer?.id

    const customerDetails = isCallCustomerSameAsTicketCustomer
        ? ticketCustomer
        : null

    const customerResponse = useGetCustomer(customerId, {
        retry: false,
        staleTime: 30 * 60 * 1000, // 30 minutes
        initialData: customerDetails
            ? axiosSuccessResponse(customerDetails)
            : undefined,
        enabled: isEnabled,
    })

    return {
        customer: customerResponse.data?.data,
        error: customerResponse.error,
    }
}

export function useAgentDetails(agentId: number) {
    const initialAgentData = window.GORGIAS_STATE?.agents?.all?.find(
        (agent) => agent.id === agentId
    )

    const agentResponse = useGetAgent(agentId, {
        retry: false,
        staleTime: 30 * 60 * 1000, // 30 minutes
        initialData: initialAgentData,
    })

    return agentResponse
}
