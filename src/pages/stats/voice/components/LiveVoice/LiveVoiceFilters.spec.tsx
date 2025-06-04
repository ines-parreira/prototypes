import { cleanup, render } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { FilterComponentKey, FilterKey } from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import * as statsSelectors from 'state/stats/selectors'
import { assumeMock } from 'utils/testing'

import LiveVoiceFilters from './LiveVoiceFilters'

jest.mock('pages/stats/common/filters/FiltersPanelWrapper')
jest.mock('hooks/reporting/useCleanStatsFilters')
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.spyOn(
    statsSelectors,
    'getPageStatsFiltersWithLogicalOperators',
).mockReturnValue({} as any)

jest.mock('core/flags')

const useFlagMock = assumeMock(useFlag)

const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)

describe('LiveVoiceFilters', () => {
    const renderComponent = () => render(<LiveVoiceFilters />)

    beforeEach(() => {
        FiltersPanelWrapperMock.mockReturnValue(<div>FiltersPanel</div>)
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.VoiceCallDuringBusinessHours) {
                return true
            }
        })
    })

    afterEach(cleanup)

    it('should render all persistent filters', () => {
        renderComponent()
        expect(FiltersPanelWrapperMock).toHaveBeenCalledWith(
            {
                persistentFilters: [
                    FilterComponentKey.PhoneIntegrations,
                    FilterKey.Agents,
                    FilterKey.VoiceQueues,
                    FilterKey.IsDuringBusinessHours,
                ],
            },
            {},
        )
    })

    it('should not render the is during business hours filter if the flag is disabled', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.VoiceCallDuringBusinessHours) {
                return false
            }
        })
        renderComponent()
        expect(FiltersPanelWrapperMock).toHaveBeenCalledWith(
            {
                persistentFilters: [
                    FilterComponentKey.PhoneIntegrations,
                    FilterKey.Agents,
                    FilterKey.VoiceQueues,
                ],
            },
            {},
        )
    })
})
