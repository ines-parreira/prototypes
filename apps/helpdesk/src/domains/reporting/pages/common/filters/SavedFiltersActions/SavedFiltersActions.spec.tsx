import React from 'react'

import { fireEvent, waitFor } from '@testing-library/react'

import { useListAnalyticsFilters } from '@gorgias/helpdesk-queries'

import { APPLY_SAVED_FILTERS } from 'domains/reporting/pages/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import { SavedFiltersActions } from 'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions'
import {
    SAVE_FILTERS,
    SAVE_FILTERS_TOOLTIP,
} from 'domains/reporting/pages/common/filters/SavedFiltersActions/SaveFilters/SaveFilters'
import {
    emptyFiltersMock,
    filterKeysMock,
    filtersMock,
} from 'domains/reporting/pages/common/filters/SavedFiltersActions/tests/helpers.spec'
import { initialiseSavedFilterDraftFromFilters } from 'domains/reporting/state/ui/stats/filtersSlice'
import useAppSelector from 'hooks/useAppSelector'
import { isTeamLead } from 'utils'
import { assumeMock, renderWithStore } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('domains/reporting/state/stats/selectors', () => ({
    getPageStatsFiltersWithLogicalOperators: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('utils')
const isTeamLeadMock = assumeMock(isTeamLead)

jest.mock('@gorgias/helpdesk-queries')
const useListAnalyticsFiltersMock = assumeMock(useListAnalyticsFilters)

describe('SavedFiltersActions for an Agent', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce({})
        useAppSelectorMock.mockReturnValueOnce(emptyFiltersMock)
        isTeamLeadMock.mockReturnValueOnce(false)
        useListAnalyticsFiltersMock.mockReturnValue({
            data: {
                data: [],
            },
        } as any)
    })

    it('should only render ApplySavedFilters', () => {
        const { queryByText, getByText } = renderWithStore(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            {},
        )

        expect(queryByText(SAVE_FILTERS)).toBeFalsy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })

    it('should render ApplySavedFilters and SaveFilters', () => {
        const { queryByText, getByText } = renderWithStore(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            {},
        )

        expect(queryByText(SAVE_FILTERS)).toBeFalsy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })
})

describe('SavedFiltersActions for an Admin or Team Lead', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValueOnce({})
        useAppSelectorMock.mockReturnValueOnce(filtersMock)
        isTeamLeadMock.mockReturnValueOnce(true)
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
                    { id: 1, name: 'Temp Filter 1', filter_group: [] },
                    { id: 2, name: 'Temp Filter 2', filter_group: [] },
                ],
            },
        } as any)

        const { getByText } = renderWithStore(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            {},
        )

        expect(getByText(SAVE_FILTERS)).toBeTruthy()

        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })

    it('should have a tooltip', async () => {
        useListAnalyticsFiltersMock.mockReturnValue({
            data: {
                data: [
                    { id: 1, name: 'Temp Filter 1', filter_group: [] },
                    { id: 2, name: 'Temp Filter 2', filter_group: [] },
                ],
            },
        } as any)

        const { getByText } = renderWithStore(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            {},
        )

        fireEvent.mouseEnter(getByText(SAVE_FILTERS))

        await waitFor(() =>
            expect(getByText(SAVE_FILTERS_TOOLTIP)).toBeTruthy(),
        )
    })

    it('should create SavedFilter draft from current filters', () => {
        useListAnalyticsFiltersMock.mockReturnValue({
            data: {
                data: [
                    { id: 1, name: 'Temp Filter 1', filter_group: [] },
                    { id: 2, name: 'Temp Filter 2', filter_group: [] },
                ],
            },
        } as any)

        const { getByText, store } = renderWithStore(
            <SavedFiltersActions optionalFilters={filterKeysMock} />,
            {},
        )

        expect(getByText(SAVE_FILTERS)).toBeTruthy()
        userEvent.click(getByText(SAVE_FILTERS))

        expect(store.getActions()).toContainEqual(
            initialiseSavedFilterDraftFromFilters(filtersMock),
        )
    })
})
