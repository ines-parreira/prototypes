import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {APPLY_SAVED_FILTERS} from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import {
    emptyFiltersMock,
    filterKeysMock,
} from 'pages/stats/common/filters/SavedFiltersActions/tests/helpers.spec'
import {assumeMock} from 'utils/testing'

jest.mock('state/currentUser/selectors')
jest.mock('state/stats/selectors')
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('launchdarkly-react-client-sdk')
const mockUseFlags = jest.mocked(useFlags)
jest.mock('pages/stats/common/filters/FiltersPanel', () => ({
    FiltersPanel: () => <>FiltersPanelMock</>,
}))
jest.mock('pages/stats/common/filters/SavedFiltersPanel', () => ({
    SavedFiltersPanel: () => <>SavedFiltersPanelMock</>,
}))
jest.mock('pages/stats/convert/providers/CampaignStatsFilters', () => ({
    CampaignStatsFilters: () => <div />,
}))

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
        const {getByText} = render(<FiltersPanelWrapper optionalFilters={[]} />)
        expect(getByText('FiltersPanelMock')).toBeTruthy()
        expect(getByText(APPLY_SAVED_FILTERS)).toBeTruthy()
    })

    it('should only show the buttons when AnalyticsSavedFilters feature flag is activated', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsSavedFilters]: false,
        })
        const {queryByText, getByText} = render(
            <FiltersPanelWrapper optionalFilters={filterKeysMock} />
        )
        expect(getByText('FiltersPanelMock')).toBeTruthy()
        expect(queryByText(APPLY_SAVED_FILTERS)).toBeFalsy()
    })
})
