import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {
    emptyFiltersMock,
    filterKeysMock,
} from 'domains/reporting/pages/common/filters/SavedFiltersActions/tests/helpers.spec'
import useAppSelector from 'hooks/useAppSelector'
import { renderWithStore } from 'utils/testing'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('domains/reporting/pages/common/filters/FiltersPanel', () => ({
    FiltersPanel: () => <>FiltersPanelMock</>,
}))
jest.mock('domains/reporting/pages/common/filters/SavedFiltersPanel', () => ({
    SavedFiltersPanel: () => <>MockedSavedFiltersPanel</>,
}))
jest.mock(
    'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions',
    () => ({
        SavedFiltersActions: () => <>SavedFiltersActionsMock</>,
    }),
)

describe('FiltersPanelWrapper', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce(
            fromJS({
                role: {
                    name: UserRole.Agent,
                },
            }),
        )
        useAppSelectorMock.mockReturnValueOnce(emptyFiltersMock)
    })

    it('should show the buttons', () => {
        renderWithStore(<FiltersPanelWrapper />, {})

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.getByText(new RegExp('MockedSavedFiltersPanel')),
        ).toBeTruthy()
    })

    it('should not show the buttons when withSavedFilters prop is false', () => {
        renderWithStore(
            <FiltersPanelWrapper
                optionalFilters={filterKeysMock}
                withSavedFilters={false}
            />,
            {},
        )

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.queryByText(new RegExp('SavedFiltersFormMock')),
        ).toBeFalsy()
    })
})
