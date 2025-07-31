import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useSearch } from '@gorgias/helpdesk-queries'

import * as searchTypes from 'models/search/types'
import { assumeMock } from 'utils/testing'

import usePhoneDeviceDialerCustomerSuggestions from '../usePhoneDeviceDialerCustomerSuggestions'

jest.mock(
    'lodash',
    () =>
        ({
            ...jest.requireActual('lodash'),
            debounce: jest.fn((fn: () => void) => fn),
        }) as Record<string, any>,
)
jest.mock('@gorgias/helpdesk-queries')

const useSearchMock = assumeMock(useSearch)

jest.spyOn(searchTypes, 'isUserSearchResult').mockReturnValue(true)

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

    beforeEach(() => {
        useSearchMock.mockReturnValue({
            isFetching: false,
            data: {
                data: {
                    data: [],
                },
            },
        } as any)
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

    it('should update highlightedResultIndex on arrow key down', () => {
        const { result } = setup()
        const customers = [
            { id: 1 },
            { id: 2 },
        ] as searchTypes.UserSearchResult[]
        useSearchMock.mockReturnValue({
            isFetching: false,
            data: { data: { data: customers } },
        } as any)

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

    it('should call onCustomerSelect on Enter key when a customer is highlighted', () => {
        const { result } = setup()
        const customers = [
            { id: 1 },
            { id: 2 },
        ] as searchTypes.UserSearchResult[]
        useSearchMock.mockReturnValue({
            isFetching: false,
            data: { data: { data: customers } },
        } as any)

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
