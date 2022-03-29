import {renderHook} from 'react-hooks-testing-library'
import {waitFor} from '@testing-library/react'
import * as apiCalls from 'models/phoneNumber/resources'

import {capabilities as capabilitiesFixtures} from 'fixtures/phoneNumber'

import {usePhoneCapabilitiesLimitationsMap} from '../usePhoneCapabilitiesLimitationsMap'

jest.spyOn(apiCalls, 'fetchPhoneCapabilities').mockReturnValue(
    new Promise((resolve) => resolve(capabilitiesFixtures))
)

describe('usePhoneCapabilitiesLimitationsMap', () => {
    it('should resolve with a map of phone number capabilities by country', async () => {
        const {result} = renderHook(() => usePhoneCapabilitiesLimitationsMap())

        await waitFor(() => {
            expect(result.current).toEqual(capabilitiesFixtures)
        })
    })
})
