import {UseQueryOptions, useQuery} from '@tanstack/react-query'
import {AxiosError} from 'axios'
import {getCustomer} from 'models/customer/resources'

export const customersKeys = {
    all: () => ['customers'] as const,
    lists: () => [...customersKeys.all(), 'list'] as const,
    details: () => [...customersKeys.all(), 'detail'] as const,
    detail: (id: number) => [...customersKeys.details(), id] as const,
}

export const useGetCustomer = <TData = Awaited<ReturnType<typeof getCustomer>>>(
    id: number,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getCustomer>>,
        AxiosError,
        TData
    >
) => {
    return useQuery({
        queryKey: customersKeys.detail(id),
        queryFn: () => getCustomer(id),
        ...overrides,
    })
}
