import { useQuery } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import { assumeMock } from 'utils/testing'

import { phoneNumberKeys, usePhoneNumberCapabilitiesMap } from '../queries'
import { fetchPhoneCapabilities } from '../resources'

jest.mock('@tanstack/react-query')

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
