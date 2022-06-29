import React, {ComponentProps} from 'react'
import {fireEvent, render, act} from '@testing-library/react'
import {fromJS, List} from 'immutable'

import {fieldEnumSearch} from 'state/views/actions'
import {flushPromises} from 'utils/testing'
import {getTicketViewField} from 'config/views'
import {ViewField} from 'models/view/types'
import Search from 'pages/common/components/Search'

import FilterDropdownSearch from '../FilterDropdownSearch'

jest.mock('state/views/actions')
const fieldEnumSearchMock = fieldEnumSearch as jest.MockedFunction<
    typeof fieldEnumSearch
>

const mockSearchChangeValue = jest.fn()
jest.mock('pages/common/components/Search', () => {
    return ({
        autoFocus,
        searchDebounceTime,
        onChange,
    }: ComponentProps<typeof Search>) => {
        return (
            <div>
                <span data-testid="auto-focus">
                    {autoFocus ? 'true' : 'false'}
                </span>
                <span data-testid="search-debounce-time">
                    {searchDebounceTime}
                </span>
                <button
                    data-testid="search-change"
                    onClick={() => onChange?.(mockSearchChangeValue())}
                />
            </div>
        )
    }
})
describe('FilterDropdownSearch', () => {
    const minProps: ComponentProps<typeof FilterDropdownSearch> = {
        field: getTicketViewField(ViewField.Assignee),
        onSearchStart: jest.fn(),
        onSearchError: jest.fn(),
        onSearchSuccess: jest.fn(),
    }
    const defaultResults = fromJS([]) as List<any>

    beforeEach(() => {
        jest.clearAllMocks()
        fieldEnumSearchMock.mockReturnValue(() =>
            Promise.resolve(defaultResults)
        )
        mockSearchChangeValue.mockReturnValue('foo')
    })

    it('should render the search bar', () => {
        const {container} = render(<FilterDropdownSearch {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should start search on mount', () => {
        render(<FilterDropdownSearch {...minProps} />)

        expect(minProps.onSearchStart).toHaveBeenLastCalledWith()
        expect(fieldEnumSearchMock).toHaveBeenLastCalledWith(
            minProps.field,
            '',
            expect.anything()
        )
    })

    it('should perform a search on search change', async () => {
        const {getByTestId} = render(<FilterDropdownSearch {...minProps} />)

        fireEvent.click(getByTestId('search-change'))
        await act(flushPromises)

        expect(minProps.onSearchStart).toHaveBeenLastCalledWith()
        expect(fieldEnumSearchMock).toHaveBeenLastCalledWith(
            minProps.field,
            'foo',
            expect.anything()
        )
        expect(minProps.onSearchSuccess).toHaveBeenLastCalledWith(
            defaultResults
        )
    })

    it('should not call onSuccess when request is cancelled', async () => {
        fieldEnumSearchMock.mockReturnValue(() => Promise.resolve(null))
        const {getByTestId} = render(<FilterDropdownSearch {...minProps} />)

        fireEvent.click(getByTestId('search-change'))
        await act(flushPromises)

        expect(minProps.onSearchSuccess).not.toBeCalled()
    })

    it('should call onError on search failure', async () => {
        fieldEnumSearchMock.mockReturnValue(() =>
            Promise.reject(new Error('Test error'))
        )
        const {getByTestId} = render(<FilterDropdownSearch {...minProps} />)

        fireEvent.click(getByTestId('search-change'))
        await act(flushPromises)

        expect(minProps.onSearchError).toHaveBeenLastCalledWith()
    })
})
