import { renderHook } from '@repo/testing'

import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'

import useReturnOrderFlow from '../useReturnOrderFlow'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

describe('useReturnOrderFlow', () => {
    beforeEach(() => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: selfServiceConfiguration1,
            storeIntegration: null,
            isFetchPending: false,
        })
    })
    it('should return a scenario', () => {
        const { result } = renderHook(() => useReturnOrderFlow('shop-name'))

        expect(result.current.selfServiceConfiguration).toMatchObject(
            selfServiceConfiguration1,
        )
    })
})
