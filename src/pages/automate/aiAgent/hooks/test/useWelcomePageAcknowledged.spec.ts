import {renderHook} from '@testing-library/react-hooks'

import {useGetWelcomePageAcknowledged} from 'models/aiAgent/queries'
import {WelcomePageAcknowledgedResponse} from 'models/aiAgent/types'

import {useWelcomePageAcknowledged} from '../useWelcomePageAcknowledged'

jest.mock('models/aiAgent/queries')

describe('useWelcomePageAcknowledged', () => {
    const accountDomain = 'my-account-domain'
    const shopName = 'test-shop'

    beforeEach(() => {
        jest.resetAllMocks()
    })

    const renderUseWelcomePageAcknowledgedHook = () => {
        return renderHook(() =>
            useWelcomePageAcknowledged({accountDomain, shopName})
        )
    }

    const mockUseGetWelcomePageAcknowledged = (
        data?: WelcomePageAcknowledgedResponse
    ) => {
        ;(useGetWelcomePageAcknowledged as jest.Mock).mockReturnValue({
            isLoading: data === undefined,
            data: data !== undefined ? {data} : undefined,
        })
    }

    it('should return loading state correctly', () => {
        mockUseGetWelcomePageAcknowledged()
        const {result} = renderUseWelcomePageAcknowledgedHook()
        expect(result.current).toEqual({isLoading: true, data: undefined})
    })

    it('should return the correct value when the welcome page is acknowledged', () => {
        const data = {acknowledged: true}
        mockUseGetWelcomePageAcknowledged(data)
        const {result} = renderUseWelcomePageAcknowledgedHook()
        expect(result.current).toEqual({isLoading: false, data})
    })

    it('should return the correct value when the welcome page is not acknowledged', () => {
        const data = {acknowledged: false}
        mockUseGetWelcomePageAcknowledged(data)
        const {result} = renderUseWelcomePageAcknowledgedHook()
        expect(result.current).toEqual({isLoading: false, data})
    })
})
