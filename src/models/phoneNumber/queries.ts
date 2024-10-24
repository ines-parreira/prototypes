import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {fetchPhoneCapabilities} from './resources'

export const phoneNumberKeys = {
    all: () => ['phone-number'] as const,
    capabilities: () => [...phoneNumberKeys.all(), 'capabilities'] as const,
}

export const usePhoneNumberCapabilitiesMap = (
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof fetchPhoneCapabilities>>
    >
) =>
    useQuery({
        queryKey: phoneNumberKeys.capabilities(),
        queryFn: fetchPhoneCapabilities,
        staleTime: Infinity,
        cacheTime: Infinity,
        ...overrides,
    })
