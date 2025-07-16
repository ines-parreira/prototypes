import { renderHook } from '@testing-library/react'

import {
    useCreateStoreMapping,
    useListStoreMappings,
} from 'models/storeMapping/queries'

import usePreferencesStoreMapping from '../usePreferencesStoreMapping'

jest.mock('models/storeMapping/queries')

const mockUseCreateStoreMapping = useCreateStoreMapping as jest.MockedFunction<
    typeof useCreateStoreMapping
>
const mockUseListStoreMappings = useListStoreMappings as jest.MockedFunction<
    typeof useListStoreMappings
>

describe('usePreferencesStoreMapping', () => {
    const mockCreateMapping = jest.fn()
    const contactForm = {
        id: 1,
        integration_id: 123,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseCreateStoreMapping.mockReturnValue({
            mutateAsync: mockCreateMapping,
        } as any)
        mockUseListStoreMappings.mockReturnValue({
            data: [],
        } as any)
    })

    it('should call useListStoreMappings with correct parameters', () => {
        renderHook(() => usePreferencesStoreMapping({ contactForm }))

        expect(mockUseListStoreMappings).toHaveBeenCalledWith([123], {
            enabled: true,
            refetchOnWindowFocus: false,
        })
    })

    it('should not create mapping when storeMappings exist', async () => {
        mockUseListStoreMappings.mockReturnValue({
            data: [{ id: 1 }],
        } as any)

        const { result } = renderHook(() =>
            usePreferencesStoreMapping({ contactForm }),
        )

        await result.current.handleStoreMappingCreation({
            shop_integration_id: 456,
        })

        expect(mockCreateMapping).not.toHaveBeenCalled()
    })

    it('should not create mapping when shop_integration_id is not provided', async () => {
        mockUseListStoreMappings.mockReturnValue({
            data: [],
        } as any)

        const { result } = renderHook(() =>
            usePreferencesStoreMapping({ contactForm }),
        )

        await result.current.handleStoreMappingCreation({})

        expect(mockCreateMapping).not.toHaveBeenCalled()
    })

    it('should not create mapping when contact form integration_id is null', async () => {
        mockUseListStoreMappings.mockReturnValue({
            data: [],
        } as any)

        const contactFormWithoutIntegration = {
            id: 1,
            integration_id: null,
        }

        const { result } = renderHook(() =>
            usePreferencesStoreMapping({
                contactForm: contactFormWithoutIntegration,
            }),
        )

        await result.current.handleStoreMappingCreation({
            shop_integration_id: 456,
        })

        expect(mockCreateMapping).not.toHaveBeenCalled()
    })

    it('should create mapping when all conditions are met', async () => {
        mockUseListStoreMappings.mockReturnValue({
            data: [],
        } as any)

        const { result } = renderHook(() =>
            usePreferencesStoreMapping({ contactForm }),
        )

        await result.current.handleStoreMappingCreation({
            shop_integration_id: 456,
        })

        expect(mockCreateMapping).toHaveBeenCalledWith([
            {
                store_id: 456,
                integration_id: 123,
            },
        ])
    })

    it('should create mapping when storeMappings is null', async () => {
        mockUseListStoreMappings.mockReturnValue({
            data: null,
        } as any)

        const { result } = renderHook(() =>
            usePreferencesStoreMapping({ contactForm }),
        )

        await result.current.handleStoreMappingCreation({
            shop_integration_id: 456,
        })

        expect(mockCreateMapping).toHaveBeenCalledWith([
            {
                store_id: 456,
                integration_id: 123,
            },
        ])
    })
})
