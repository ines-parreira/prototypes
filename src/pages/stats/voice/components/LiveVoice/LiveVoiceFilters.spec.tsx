import {render, cleanup} from '@testing-library/react'

import React from 'react'

import {FilterComponentKey, FilterKey} from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import * as statsSelectors from 'state/stats/selectors'

import {assumeMock} from 'utils/testing'

import LiveVoiceFilters from './LiveVoiceFilters'

jest.mock('pages/stats/common/filters/FiltersPanelWrapper')
jest.mock('hooks/reporting/useCleanStatsFilters')
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.spyOn(
    statsSelectors,
    'getPageStatsFiltersWithLogicalOperators'
).mockReturnValue({} as any)

const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)

describe('LiveVoiceFilters', () => {
    const renderComponent = () => render(<LiveVoiceFilters />)

    beforeEach(() => {
        FiltersPanelWrapperMock.mockReturnValue(<div>FiltersPanel</div>)
    })

    afterEach(cleanup)

    it('should render integrations and agents filter', () => {
        renderComponent()
        expect(FiltersPanelWrapperMock).toHaveBeenCalledWith(
            {
                persistentFilters: [
                    FilterComponentKey.PhoneIntegrations,
                    FilterKey.Agents,
                ],
            },
            {}
        )
    })
})
