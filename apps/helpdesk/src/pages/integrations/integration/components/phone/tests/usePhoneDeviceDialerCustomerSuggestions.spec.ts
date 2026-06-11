import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockSearchHandler, mockSearchResponse } from '@gorgias/helpdesk-mocks'

import * as searchTypes from 'models/search/types'

import { usePhoneDeviceDialerCustomerSuggestions } from '../usePhoneDeviceDialerCustomerSuggestions'

jest.mock(
    'lodash',
    () =>
        ({
            ...jest.requireActual('lodash'),
            debounce: jest.fn((fn: () => void) => fn),
        }) as Record<string, any>,
)

jest.spyOn(searchTypes, 'isUserSearchResult').mockReturnValue(true)

const searchHandler = mockSearchHandler(async () =>
    HttpResponse.json(mockSearchResponse({ data: [] })),
)
const server = setupServer(searchHandler.handler)

describe('usePhoneDeviceDialerCustomerSuggestions', () => {
    const onEnter = jest.fn()
    const onCustomerSelect = jest.fn()
    const minSearchInputLength = 3

    const setup = () => {
        return renderHook(() =>
            usePhoneDeviceDialerCustomerSuggestions({
                onEnter,
                minSearchInputLength,
                onCustomerSelect,
            }),
        )
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should initialize with default values', () => {
        const { result } = setup()

        expect(result.current.isFetching).toBe(false)
        expect(result.current.highlightedResultIndex).toBeNull()
        expect(result.current.customers).toEqual([])
        expect(result.current.debouncedSearchCustomers).toEqual(
            expect.any(Function),
        )
    })

    it('should update highlightedResultIndex on arrow key down', async () => {
        const customers = [
            { id: 1 },
            { id: 2 },
        ] as searchTypes.UserSearchResult[]
        server.use(
            mockSearchHandler(async () =>
                HttpResponse.json(mockSearchResponse({ data: customers })),
            ).handler,
        )

        const { result } = setup()

        act(() => {
            result.current.debouncedSearchCustomers('123')
        })

        await waitFor(() => {
            expect(result.current.customers).toEqual(customers)
        })

        act(() => {
            result.current.handleInputKeyDown({
                key: 'ArrowDown',
                preventDefault: jest.fn(),
            } as any)
        })

        expect(result.current.highlightedResultIndex).toBe(0)

        act(() => {
            result.current.handleInputKeyDown({
                key: 'ArrowDown',
                preventDefault: jest.fn(),
            } as any)
        })

        expect(result.current.highlightedResultIndex).toBe(1)
    })

    it('should call onEnter on Enter key when no customer is highlighted', () => {
        const { result } = setup()

        act(() => {
            result.current.handleInputKeyDown({
                key: 'Enter',
                stopPropagation: jest.fn(),
            } as any)
        })

        expect(onEnter).toHaveBeenCalled()
    })

    it('should call onCustomerSelect on Enter key when a customer is highlighted', async () => {
        const customers = [
            { id: 1 },
            { id: 2 },
        ] as searchTypes.UserSearchResult[]
        server.use(
            mockSearchHandler(async () =>
                HttpResponse.json(mockSearchResponse({ data: customers })),
            ).handler,
        )

        const { result } = setup()

        act(() => {
            result.current.debouncedSearchCustomers('123')
        })

        await waitFor(() => {
            expect(result.current.customers).toEqual(customers)
        })

        act(() => {
            result.current.handleInputKeyDown({
                key: 'ArrowDown',
                preventDefault: jest.fn(),
            } as any)
        })

        act(() => {
            result.current.handleInputKeyDown({
                key: 'Enter',
                stopPropagation: jest.fn(),
            } as any)
        })

        expect(onCustomerSelect).toHaveBeenCalledWith(customers[0])
    })
})
