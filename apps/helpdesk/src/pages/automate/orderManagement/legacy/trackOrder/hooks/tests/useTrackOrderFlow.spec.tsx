import { renderHook } from '@repo/testing'

import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import useTrackOrderFlow from '../useTrackOrderFlow'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

describe('useTrackOrderFlow', () => {
    beforeEach(() => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: null,
            isFetchPending: false,
        })
    })
    it('should return self service configuration', () => {
        const { result } = renderHook(() => useTrackOrderFlow('shop-name'))

        expect(result.current.selfServiceConfiguration).toMatchObject(
            mockSelfServiceConfiguration,
        )
    })
})
