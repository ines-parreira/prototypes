import {useMutation, useQuery, UseQueryOptions} from '@tanstack/react-query'
import {CONVERT_DEFAULT_OPTIONS} from 'models/convert/constants'
import {useConvertApi} from 'pages/convert/common/hooks/useConvertApi'
import {MutationOverrides} from 'types/query'
import {
    getDiscountOffers,
    createDiscountOffer,
    updateDiscountOffer,
    deleteDiscountOffer,
} from './resources'
import {UniqueDiscountListParams, UniqueDiscountOffer} from './types'

export const uniqueDiscountOfferKeys = {
    all: () => ['uniqueDiscountOffer'] as const,
    lists: () => [...uniqueDiscountOfferKeys.all(), 'list'] as const,
    list: (params: UniqueDiscountListParams) =>
        [...uniqueDiscountOfferKeys.lists(), params] as const,
}

export const useListDiscountOffers = (
    params: UniqueDiscountListParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getDiscountOffers>>,
        unknown,
        UniqueDiscountOffer[]
    >
) => {
    const {client: convertClient} = useConvertApi()

    return useQuery({
        queryKey: uniqueDiscountOfferKeys.list(params),
        queryFn: () => getDiscountOffers(convertClient, params),
        select: (data) => (data?.data ?? []) as UniqueDiscountOffer[],
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
        enabled: !!convertClient && (overrides?.enabled ?? true),
    })
}

export const useCreateDiscountOffer = (
    overrides?: MutationOverrides<typeof createDiscountOffer>
) => {
    const {client: convertClient} = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, data]) =>
            createDiscountOffer(client, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useUpdateDiscountOffer = (
    overrides?: MutationOverrides<typeof updateDiscountOffer>
) => {
    const {client: convertClient} = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, params, data]) =>
            updateDiscountOffer(client, params, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useDeleteDiscountOffer = (
    overrides?: MutationOverrides<typeof deleteDiscountOffer>
) => {
    const {client: convertClient} = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, params]) =>
            deleteDiscountOffer(client, params),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}
