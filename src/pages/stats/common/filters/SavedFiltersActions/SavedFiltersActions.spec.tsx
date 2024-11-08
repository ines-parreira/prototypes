import {useListAnalyticsFilters} from '@gorgias/api-queries'
import userEvent from '@testing-library/user-event'
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
import {initialiseSavedFilterDraftFromFilters} from 'state/ui/stats/filtersSlice'
import {isAdmin} from 'utils'
import {assumeMock, renderWithStore} from 'utils/testing'

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

jest.mock('@gorgias/api-queries')
const useListAnalyticsFiltersMock = assumeMock(useListAnalyticsFilters)

describe('SavedFiltersActions for an Agent', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce({})
        useAppSelectorMock.mockReturnValueOnce(emptyFiltersMock)
        isAdminMock.mockReturnValueOnce(false)
        useListAnalyticsFiltersMock.mockReturnValue({
            data: {
                data: [],
            },
        } as any)
    })

    it('should only render ApplySavedFilters', () => {
        const {queryByText, getByText} = renderWithStore(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            {}
        )

        expect(queryByText(SAVE_FILTERS)).toBeFalsy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })

    it('should render ApplySavedFilters and SaveFilters', () => {
        const {queryByText, getByText} = renderWithStore(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            {}
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
        useListAnalyticsFiltersMock.mockReturnValue({
            data: {
                data: [],
            },
        } as any)
    })

    it('should render ApplySavedFilters and SaveFilters', () => {
        useListAnalyticsFiltersMock.mockReturnValue({
            data: {
                data: [
                    {id: 1, name: 'Temp Filter 1', filter_group: []},
                    {id: 2, name: 'Temp Filter 2', filter_group: []},
                ],
            },
        } as any)

        const {getByText} = renderWithStore(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            {}
        )

        expect(getByText(SAVE_FILTERS)).toBeTruthy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })

    it('should create SavedFilter draft from current filters', () => {
        useListAnalyticsFiltersMock.mockReturnValue({
            data: {
                data: [
                    {id: 1, name: 'Temp Filter 1', filter_group: []},
                    {id: 2, name: 'Temp Filter 2', filter_group: []},
                ],
            },
        } as any)

        const {getByText, store} = renderWithStore(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            {}
        )

        expect(getByText(SAVE_FILTERS)).toBeTruthy()
        userEvent.click(getByText(SAVE_FILTERS))

        expect(store.getActions()).toContainEqual(
            initialiseSavedFilterDraftFromFilters(filtersMock)
        )
    })
})
