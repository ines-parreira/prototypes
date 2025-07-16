import { renderHook } from '@testing-library/react'

import useViewStoreMapping from '../useViewStoreMapping'

jest.mock('config/featureFlags')
jest.mock('core/flags')
jest.mock('models/storeMapping/queries')

const mockCreateMapping = jest.fn()

jest.mock('models/storeMapping/queries', () => ({
    useCreateStoreMapping: () => ({
        mutate: mockCreateMapping,
    }),
}))

describe('useViewStoreMapping', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call createMapping when contact form has required IDs', () => {
        const { result } = renderHook(() => useViewStoreMapping())

        const contactForm = {
            integration_id: 123,
            shop_integration_id: 456,
        }

        result.current.handleStoreMapping(contactForm)

        expect(mockCreateMapping).toHaveBeenCalledWith([
            {
                store_id: 456,
                integration_id: 123,
            },
        ])
    })

    it('should not call createMapping when integration_id is missing', () => {
        const { result } = renderHook(() => useViewStoreMapping())

        const contactForm = {
            integration_id: null,
            shop_integration_id: 456,
        }

        result.current.handleStoreMapping(contactForm)

        expect(mockCreateMapping).not.toHaveBeenCalled()
    })

    it('should not call createMapping when shop_integration_id is missing', () => {
        const { result } = renderHook(() => useViewStoreMapping())

        const contactForm = {
            integration_id: 123,
            shop_integration_id: null,
        }

        result.current.handleStoreMapping(contactForm)

        expect(mockCreateMapping).not.toHaveBeenCalled()
    })
})
