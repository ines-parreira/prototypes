import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
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
jest.mock('launchdarkly-react-client-sdk')
const mockUseFlags = jest.mocked(useFlags)
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

    it('should only show the buttons when AnalyticsSavedFilters feature flag is activated', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsSavedFilters]: true,
        })

        renderWithStore(<FiltersPanelWrapper />, {})

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.getByText(new RegExp('MockedSavedFiltersPanel'))
        ).toBeTruthy()
    })

    it('should not show the buttons when AnalyticsSavedFilters feature flag is inactive', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsSavedFilters]: false,
        })

        renderWithStore(
            <FiltersPanelWrapper optionalFilters={filterKeysMock} />,
            {}
        )

        expect(screen.getByText(new RegExp('FiltersPanelMock'))).toBeTruthy()
        expect(
            screen.queryByText(new RegExp('SavedFiltersFormMock'))
        ).toBeFalsy()
    })

    it('should not show the buttons when withSavedFilters prop is false', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsSavedFilters]: true,
        })

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
