import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {useConvertApi} from 'pages/convert/common/hooks/useConvertApi'
import {CONVERT_DEFAULT_OPTIONS} from '../constants'
import {getDiscountOffers} from './resources'
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
