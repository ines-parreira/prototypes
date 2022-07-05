import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'

import {getConfigByName, getTicketViewField} from 'config/views'
import {ViewField} from 'models/view/types'
import useSearchRankScenario from 'hooks/useSearchRankScenario'
import FilterDropdownSearch from 'pages/common/components/ViewTable/FilterDropdownSearch'
import FilterDropdownItems from 'pages/common/components/ViewTable/FilterDropdownItems'
import {mockSearchRank} from 'fixtures/searchRank'

import FilterDropdown from '../FilterDropdown'

const mockSearchResults = jest.fn()
jest.mock('pages/common/components/ViewTable/FilterDropdownSearch', () => {
    return ({
        onSearchError,
        onSearchStart,
        onSearchSuccess,
    }: ComponentProps<typeof FilterDropdownSearch>) => {
        return (
            <div>
                <button
                    data-testid="search-start"
                    onClick={() => onSearchStart()}
                />
                <button
                    data-testid="search-success"
                    onClick={() => onSearchSuccess(mockSearchResults())}
                />
                <button
                    data-testid="search-error"
                    onClick={() => onSearchError()}
                />
            </div>
        )
    }
})

const mockClickedItem = jest.fn()
jest.mock('pages/common/components/ViewTable/FilterDropdownItems', () => {
    return ({
        isLoading,
        items,
        onItemClick,
        onMeItemClick,
    }: ComponentProps<typeof FilterDropdownItems>) => {
        return (
            <div>
                <span data-testid="is-loading">
                    {isLoading ? 'true' : 'false'}
                </span>
                <span data-testid="items">
                    {JSON.stringify(items, null, 2)}
                </span>
                <button data-testid="me-item" onClick={() => onMeItemClick()} />
                <button
                    data-testid="item"
                    onClick={() => onItemClick(mockClickedItem())}
                />
            </div>
        )
    }
})

jest.mock('hooks/useSearchRankScenario')
const useSearchRankScenarioMock = useSearchRankScenario as jest.MockedFunction<
    typeof useSearchRankScenario
>
useSearchRankScenarioMock.mockImplementation(() => mockSearchRank)

describe('FilterDropdown', () => {
    const defaultItem = {id: 1, name: 'Foo', email: 'foo@example.com'}
    const defaultSearchResults = [defaultItem]
    const minProps: ComponentProps<typeof FilterDropdown> = {
        field: getTicketViewField(ViewField.Customer),
        viewConfig: getConfigByName('ticket'),
        updateFieldFilter: jest.fn(),
        toggleDropdown: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockSearchResults.mockReturnValue(fromJS(defaultSearchResults))
        mockClickedItem.mockReturnValue(defaultItem)
    })

    it('should render items from filter enum', () => {
        const {container} = render(
            <FilterDropdown
                {...minProps}
                field={getTicketViewField(ViewField.Customer).setIn(
                    ['filter', 'enum'],
                    fromJS(defaultSearchResults)
                )}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should apply a special style to the language filter', () => {
        const {container} = render(
            <FilterDropdown
                {...minProps}
                field={getTicketViewField(ViewField.Language)}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render custom menu', () => {
        const {container} = render(
            <FilterDropdown {...minProps} menu={() => <div>Custom menu</div>} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should set isLoading to true on search start', () => {
        const {getByTestId} = render(<FilterDropdown {...minProps} />)

        fireEvent.click(getByTestId('search-start'))

        expect(getByTestId('is-loading').innerHTML).toMatch('true')
    })

    it('should render the search results', () => {
        const {container, getByTestId} = render(
            <FilterDropdown {...minProps} />
        )

        fireEvent.click(getByTestId('search-success'))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call updateFieldFilter on item click', () => {
        const {getByTestId} = render(<FilterDropdown {...minProps} />)

        fireEvent.click(getByTestId('item'))

        expect(
            (minProps.updateFieldFilter as jest.Mock).mock.calls
        ).toMatchSnapshot()
    })

    it('should call updateFieldFilter on me item click', () => {
        const {getByTestId} = render(<FilterDropdown {...minProps} />)

        fireEvent.click(getByTestId('me-item'))

        expect(
            (minProps.updateFieldFilter as jest.Mock).mock.calls
        ).toMatchSnapshot()
    })
})
