import { renderHook, waitFor } from '@testing-library/react'

import { useTicketCustomFieldsValues } from '../hooks/useTicketCustomFieldsValues'
import { useInitializeTicketFieldsStore } from '../store/useInitializeTicketFieldsStore'
import { useTicketFieldsStore } from '../store/useTicketFieldsStore'

vi.mock('../hooks/useTicketCustomFieldsValues')

const mockUseTicketCustomFieldsValues = vi.mocked(useTicketCustomFieldsValues)

describe('useInitializeTicketFieldsStore', () => {
    beforeEach(() => {
        useTicketFieldsStore.getState().resetFields()
        vi.clearAllMocks()
    })

    it('should return loading state when data is loading', () => {
        mockUseTicketCustomFieldsValues.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useInitializeTicketFieldsStore('123'),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(false)
    })

    it('should return error state when data fetch fails', () => {
        mockUseTicketCustomFieldsValues.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as any)

        const { result } = renderHook(() =>
            useInitializeTicketFieldsStore('123'),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(true)
    })

    it('should initialize store with field values from API', async () => {
        const mockFieldsData = [
            {
                field: { id: 1, label: 'Priority' },
                value: 'High',
            },
            {
                field: { id: 2, label: 'Category' },
                value: 'Bug',
            },
        ]

        mockUseTicketCustomFieldsValues.mockReturnValue({
            data: { data: mockFieldsData },
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useInitializeTicketFieldsStore('123'),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        const storeFields = useTicketFieldsStore.getState().fields

        expect(storeFields[1]).toEqual({
            id: 1,
            value: 'High',
            hasError: false,
            prediction: undefined,
        })

        expect(storeFields[2]).toEqual({
            id: 2,
            value: 'Bug',
            hasError: false,
            prediction: undefined,
        })
    })

    it('should handle different value types and edge cases', async () => {
        const mockFieldsData = [
            {
                field: { id: 1, label: 'Text Field' },
                value: 'string value',
            },
            {
                field: { id: 2, label: 'Number Field' },
                value: 42,
            },
            {
                field: { id: 3, label: 'Boolean Field' },
                value: true,
            },
            {
                field: null, // Invalid field - should be skipped
                value: 'should not appear',
            },
        ]

        mockUseTicketCustomFieldsValues.mockReturnValue({
            data: { data: mockFieldsData },
            isLoading: false,
            isError: false,
        } as any)

        renderHook(() => useInitializeTicketFieldsStore('123'))

        await waitFor(() => {
            const storeFields = useTicketFieldsStore.getState().fields

            // Should have 3 valid fields (null field skipped)
            expect(Object.keys(storeFields)).toHaveLength(3)

            // String value
            expect(storeFields[1]).toEqual({
                id: 1,
                value: 'string value',
                hasError: false,
                prediction: undefined,
            })

            // Numeric value
            expect(storeFields[2]).toEqual({
                id: 2,
                value: 42,
                hasError: false,
                prediction: undefined,
            })

            // Boolean value
            expect(storeFields[3]).toEqual({
                id: 3,
                value: true,
                hasError: false,
                prediction: undefined,
            })
        })
    })

    it('should handle empty field values array', async () => {
        mockUseTicketCustomFieldsValues.mockReturnValue({
            data: { data: [] },
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useInitializeTicketFieldsStore('123'),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        const storeFields = useTicketFieldsStore.getState().fields
        expect(storeFields).toEqual({})
    })

    it('should not initialize store when still loading', () => {
        const mockFieldsData = [
            {
                field: { id: 1, label: 'Test' },
                value: 'Test Value',
            },
        ]

        mockUseTicketCustomFieldsValues.mockReturnValue({
            data: { data: mockFieldsData },
            isLoading: true,
            isError: false,
        } as any)

        renderHook(() => useInitializeTicketFieldsStore('123'))

        const storeFields = useTicketFieldsStore.getState().fields
        expect(storeFields).toEqual({})
    })

    it('should not initialize store when there is an error', () => {
        const mockFieldsData = [
            {
                field: { id: 1, label: 'Test' },
                value: 'Test Value',
            },
        ]

        mockUseTicketCustomFieldsValues.mockReturnValue({
            data: { data: mockFieldsData },
            isLoading: false,
            isError: true,
        } as any)

        renderHook(() => useInitializeTicketFieldsStore('123'))

        const storeFields = useTicketFieldsStore.getState().fields
        expect(storeFields).toEqual({})
    })
})
