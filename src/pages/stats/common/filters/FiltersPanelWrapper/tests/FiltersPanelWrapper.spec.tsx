import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'

import React from 'react'

import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {FiltersPanelWrapper} from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {
    emptyFiltersMock,
    filterKeysMock,
} from 'pages/stats/common/filters/SavedFiltersActions/tests/helpers.spec'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('pages/stats/common/filters/FiltersPanel', () => ({
    FiltersPanel: () => <>FiltersPanelMock</>,
}))
jest.mock('pages/stats/common/filters/SavedFiltersPanel', () => ({
    SavedFiltersPanel: () => <>MockedSavedFiltersPanel</>,
}))
jest.mock(
    'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions',
    () => ({
        SavedFiltersActions: () => <>SavedFiltersActionsMock</>,
    })
)

describe('FiltersPanelWrapper', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce(
            fromJS({
                role: {
                    name: UserRole.Agent,
                },
            })
        )
        useAppSelectorMock.mockReturnValueOnce(emptyFiltersMock)
    })

    it('should show the buttons', () => {
        renderWithStore(<FiltersPanelWrapper />, {})

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.getByText(new RegExp('MockedSavedFiltersPanel'))
        ).toBeTruthy()
    })

    it('should not show the buttons when withSavedFilters prop is false', () => {
        renderWithStore(
            <FiltersPanelWrapper
                optionalFilters={filterKeysMock}
                withSavedFilters={false}
            />,
            {}
        )

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.queryByText(new RegExp('SavedFiltersFormMock'))
        ).toBeFalsy()
    })
})
