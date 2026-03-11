import React from 'react'

import { assumeMock, getLastMockCall } from '@repo/testing'
import { act, render, waitFor } from '@testing-library/react'
import { List, Map } from 'immutable'
import _noop from 'lodash/noop'

import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import type { FieldSearchResult } from 'state/views/types'

import { FilterMultiSelectField } from '../FilterMultiSelectField'

jest.mock(
    'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField',
    () => jest.fn(() => <div>MultiSelect</div>),
)

const mockedMultiSelectOptionsField = assumeMock(MultiSelectOptionsField)

describe('FilterMultiSelectField', () => {
    const mockedSearchFunction = jest.fn(
        () => Promise.resolve() as Promise<Maybe<List<any>>>,
    )

    const mockedMapSearchResults = jest.fn(
        (something: FieldSearchResult[]) => something as unknown as Option[],
    )

    const defaultProps = {
        plural: 'foos',
        singular: 'foo',
        selectedOptions: [],
        onChange: _noop,
        field: Map(),
        fieldEnumSearchCancellable: mockedSearchFunction,
        cancelFieldEnumSearchCancellable: _noop,
        mapSearchResults: mockedMapSearchResults,
        dropdownMenu: () => <div>DropdownMenu</div>,
    }

    it('should pass correct props to MultiSelectOptionsField', () => {
        render(<FilterMultiSelectField {...defaultProps} />)
        expect(mockedMultiSelectOptionsField).toHaveBeenCalledWith(
            expect.objectContaining({
                loading: false,
                singular: defaultProps.singular,
                plural: defaultProps.plural,
                selectedOptions: defaultProps.selectedOptions,
                options: [],
                dropdownMenu: defaultProps.dropdownMenu,
                onInputChange: expect.any(Function),
                onChange: expect.any(Function),
            }),
            {},
        )
    })

    it('should search for empty value on mount', () => {
        render(<FilterMultiSelectField {...defaultProps} />)
        expect(mockedSearchFunction).toHaveBeenCalledTimes(1)
        expect(mockedSearchFunction).toHaveBeenLastCalledWith(Map(), '')
    })

    it('should call onChange prop with options when children onChange is called', () => {
        const onChange = jest.fn()
        render(<FilterMultiSelectField {...defaultProps} onChange={onChange} />)
        act(() => {
            getLastMockCall(mockedMultiSelectOptionsField)[0].onChange([
                'foo',
                'bar',
            ] as unknown as Option[])
        })
        expect(onChange).toHaveBeenCalledWith(['foo', 'bar'])
    })

    it('should reset search when children onChange is called', () => {
        render(<FilterMultiSelectField {...defaultProps} />)
        act(() => {
            getLastMockCall(mockedMultiSelectOptionsField)[0].onChange([
                'foo',
            ] as unknown as Option[])
        })
        expect(mockedSearchFunction).toHaveBeenLastCalledWith(Map(), '')
    })

    it('should debounce search on input change', () => {
        jest.useFakeTimers()
        render(<FilterMultiSelectField {...defaultProps} />)
        act(() => {
            getLastMockCall(mockedMultiSelectOptionsField)[0].onInputChange!(
                'f',
            )
            getLastMockCall(mockedMultiSelectOptionsField)[0].onInputChange!(
                'fo',
            )
            getLastMockCall(mockedMultiSelectOptionsField)[0].onInputChange!(
                'foo',
            )
        })
        jest.runAllTimers()
        expect(mockedSearchFunction).toHaveBeenCalledTimes(2) // two times, because first time on mount
        expect(mockedSearchFunction).toHaveBeenLastCalledWith(Map(), 'foo')
    })

    it('should do nothing on search if field already had a filter enum', () => {
        const field = Map({ filter: Map({ enum: true }) })
        render(<FilterMultiSelectField {...defaultProps} field={field} />)
        expect(mockedSearchFunction).toHaveBeenCalledTimes(0)
    })

    it('should not set options to MultiSelectOptionsField if there is no search data', async () => {
        jest.useFakeTimers()
        // Will resolve with data on first call, and return falsy value on second call
        mockedSearchFunction.mockResolvedValueOnce(
            Promise.resolve(List(['stuff'])),
        )
        render(<FilterMultiSelectField {...defaultProps} />)
        act(() => {
            getLastMockCall(mockedMultiSelectOptionsField)[0].onInputChange!(
                'foo',
            )
        })
        jest.runAllTimers()
        // Options should stick to first returned value
        await waitFor(() => {
            expect(mockedSearchFunction).toHaveBeenCalledTimes(2)
            expect(mockedMapSearchResults).toHaveBeenCalledTimes(1)
            expect(getLastMockCall(mockedMultiSelectOptionsField)[0]).toEqual(
                expect.objectContaining({
                    options: ['stuff'],
                }),
            )
        })
    })

    it('should pass correct options to MultiSelectOptionsField after searching', async () => {
        mockedMapSearchResults.mockImplementation(
            (something: FieldSearchResult[]) =>
                something.map(
                    (string) => (string as unknown as string) + 'f',
                ) as unknown as Option[],
        )
        jest.useFakeTimers()

        mockedSearchFunction.mockResolvedValue(Promise.resolve(List(['stuff'])))
        render(<FilterMultiSelectField {...defaultProps} />)
        act(() => {
            getLastMockCall(mockedMultiSelectOptionsField)[0].onInputChange!(
                'foo',
            )
        })
        jest.runAllTimers()
        await waitFor(() => {
            expect(mockedSearchFunction).toHaveBeenCalledTimes(2)
            expect(mockedMapSearchResults).toHaveBeenCalledTimes(2)
            expect(getLastMockCall(mockedMultiSelectOptionsField)[0]).toEqual(
                expect.objectContaining({
                    // Options actually go through provided mapper
                    options: ['stufff'],
                }),
            )
        })
    })
})
