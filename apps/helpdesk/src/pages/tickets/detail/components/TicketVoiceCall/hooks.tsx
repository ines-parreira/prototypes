import { useGetCustomer } from '@repo/customer/hooks'
import { Duration } from '@gorgias/toolkit'

import type { getCustomer } from '@gorgias/helpdesk-client'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import useAppSelector from 'hooks/useAppSelector'
import { useGetAgent } from 'models/agents/queries'
import type { Customer } from 'models/customer/types'
import { getTicketCustomer } from 'state/ticket/selectors'

type CustomerResponse = {
    data: Customer
}

type GeneratedCustomerResponse = Awaited<ReturnType<typeof getCustomer>>

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

    const customerResponse = useGetCustomer<CustomerResponse>(
        customerId,
        undefined,
        {
            query: {
                retry: false,
                initialData: customerDetails
                    ? (axiosSuccessResponse(
                          customerDetails,
                      ) as unknown as GeneratedCustomerResponse)
                    : undefined,
                enabled: isEnabled,
            },
        },
    )

    return {
        customer: customerResponse.data?.data,
        error: customerResponse.error,
    }
}

export function useAgentDetails(agentId: number) {
    const initialAgentData = window.GORGIAS_STATE?.agents?.all?.find(
        (agent) => agent.id === agentId,
    )

    const agentResponse = useGetAgent(agentId, {
        retry: false,
        staleTime: Duration.minutes(30),
        initialData: initialAgentData,
    })

    return agentResponse
}
