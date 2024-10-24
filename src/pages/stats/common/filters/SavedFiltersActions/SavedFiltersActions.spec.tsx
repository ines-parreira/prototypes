import {render} from '@testing-library/react'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {APPLY_SAVED_FILTERS} from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import {SavedFiltersActions} from 'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions'
import {SAVE_FILTERS} from 'pages/stats/common/filters/SavedFiltersActions/SaveFilters/SaveFilters'
import {
    emptyFiltersMock,
    filterKeysMock,
    filtersMock,
} from 'pages/stats/common/filters/SavedFiltersActions/tests/helpers.spec'
import {isAdmin} from 'utils'

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('state/stats/selectors', () => ({
    getPageStatsFiltersWithLogicalOperators: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock
jest.mock('utils')
const isAdminMock = isAdmin as jest.Mock

describe('SavedFiltersActions for an Agent', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce({})
        useAppSelectorMock.mockReturnValueOnce(emptyFiltersMock)
        isAdminMock.mockReturnValueOnce(false)
    })

    it('should only render ApplySavedFilters', () => {
        const {queryByText, getByText} = render(
            <SavedFiltersActions
                optionalFilters={filterKeysMock}
                savedFilters={[]}
                onSaveFilters={() => {}}
            />
        )

        expect(queryByText(SAVE_FILTERS)).toBeFalsy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })

    it('should render ApplySavedFilters and SaveFilters', () => {
        const {queryByText, getByText} = render(
            <SavedFiltersActions
                optionalFilters={filterKeysMock}
                savedFilters={[]}
                onSaveFilters={() => {}}
            />
        )

        expect(queryByText(SAVE_FILTERS)).toBeFalsy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })
})

describe('SavedFiltersActions for an Admin', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce({})
        useAppSelectorMock.mockReturnValueOnce(filtersMock)
        isAdminMock.mockReturnValueOnce(true)
    })

    it('should render ApplySavedFilters and SaveFilters', () => {
        const {getByText} = render(
            <SavedFiltersActions
                optionalFilters={filterKeysMock}
                savedFilters={[
                    {id: 1, name: 'Temp Filter 1'},
                    {id: 2, name: 'Temp Filter 2'},
                ]}
                onSaveFilters={() => {}}
            />
        )

        expect(getByText(SAVE_FILTERS)).toBeTruthy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })
})
