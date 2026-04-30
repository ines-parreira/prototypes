import { assumeMock, renderHook } from '@repo/testing'
import { useQuery } from '@tanstack/react-query'

import { phoneNumberKeys, usePhoneNumberCapabilitiesMap } from '../queries'
import { fetchPhoneCapabilities } from '../resources'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}))

const useQueryMock = assumeMock(useQuery)

describe('phone numbers queries', () => {
    it('should call the useQuery hook properly', () => {
        const overrides = { enabled: true, refetchOnWindowFocus: false }
        renderHook(() => usePhoneNumberCapabilitiesMap(overrides))

        expect(useQueryMock).toBeCalledWith({
            queryKey: phoneNumberKeys.capabilities(),
            queryFn: fetchPhoneCapabilities,
            staleTime: Infinity,
            cacheTime: Infinity,
            ...overrides,
        })
    })
})
