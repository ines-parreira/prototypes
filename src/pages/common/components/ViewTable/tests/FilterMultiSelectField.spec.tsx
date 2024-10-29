import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'
import _noop from 'lodash/noop'

import React from 'react'
import {InferThunkActionCreatorType} from 'react-redux'

import {FilterMultiSelectField} from 'pages/common/components/ViewTable/FilterMultiSelectField'

import {fieldEnumSearch} from 'state/views/actions'

import {FieldSearchResult} from 'state/views/types'

describe('FilterMultiSelectField', () => {
    const defaultProps = {
        plural: 'foos',
        singular: 'foo',
        selectedOptions: [],
        onChange: _noop,
        field: Map(),
        fieldEnumSearchCancellable: () => Promise.resolve(),
        cancelFieldEnumSearchCancellable: _noop,
        mapSearchResults: (searchResults: FieldSearchResult[]) =>
            searchResults.map((res) => ({
                value: res.id,
                label: res.name,
            })),
    }

    beforeEach(() => {
        jest.useFakeTimers()
    })
    it('should search for the values on mount', async () => {
        const fieldEnumSearchSpy = (
            jest.fn() as jest.MockedFunction<
                InferThunkActionCreatorType<typeof fieldEnumSearch>
            >
        ).mockResolvedValue(null)

        render(
            <FilterMultiSelectField
                {...defaultProps}
                fieldEnumSearchCancellable={fieldEnumSearchSpy}
            />
        )

        await waitFor(() => {
            expect(fieldEnumSearchSpy).toBeCalled()
        })
    })

    it('should debounce search on input change', () => {
        const fieldEnumSearchSpy = (
            jest.fn() as jest.MockedFunction<
                InferThunkActionCreatorType<typeof fieldEnumSearch>
            >
        ).mockResolvedValue(null)

        render(
            <FilterMultiSelectField
                {...defaultProps}
                fieldEnumSearchCancellable={fieldEnumSearchSpy}
            />
        )
        userEvent.paste(screen.getByRole('textbox'), 'foo')
        userEvent.clear(screen.getByRole('textbox'))
        userEvent.paste(screen.getByRole('textbox'), 'bar')
        userEvent.clear(screen.getByRole('textbox'))
        userEvent.paste(screen.getByRole('textbox'), 'baz')
        jest.runAllTimers()

        expect(fieldEnumSearchSpy).toHaveBeenCalledTimes(2) // two times, because first time on mount
        expect(fieldEnumSearchSpy).toHaveBeenLastCalledWith(Map(), 'baz')
    })

    it('should reset search on change', async () => {
        const fieldEnumSearchSpy = (
            jest.fn() as jest.MockedFunction<
                InferThunkActionCreatorType<typeof fieldEnumSearch>
            >
        ).mockResolvedValue(fromJS([{id: 123, name: '123'}]))

        render(
            <FilterMultiSelectField
                {...defaultProps}
                fieldEnumSearchCancellable={fieldEnumSearchSpy}
            />
        )

        await waitFor(() => {
            userEvent.clear(screen.getByRole('textbox'))
            userEvent.click(screen.getByRole('menuitem'))
        })

        expect(fieldEnumSearchSpy).toHaveBeenCalledTimes(2) // first time on mount
    })
})
