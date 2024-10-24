import {render, cleanup} from '@testing-library/react'
import React from 'react'

import {FilterComponentKey, FilterKey} from 'models/stat/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import * as statsSelectors from 'state/stats/selectors'

import {assumeMock} from 'utils/testing'

import LiveVoiceFilters from './LiveVoiceFilters'

jest.mock('pages/stats/common/filters/FiltersPanel')
jest.mock('hooks/reporting/useCleanStatsFilters')
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.spyOn(
    statsSelectors,
    'getPageStatsFiltersWithLogicalOperators'
).mockReturnValue({} as any)

const FiltersPanelMock = assumeMock(FiltersPanel)

describe('LiveVoiceFilters', () => {
    const renderComponent = () => render(<LiveVoiceFilters />)

    beforeEach(() => {
        FiltersPanelMock.mockReturnValue(<div>FiltersPanel</div>)
    })

    afterEach(cleanup)

    it('should render integrations and agents filter', () => {
        renderComponent()
        expect(FiltersPanelMock).toHaveBeenCalledWith(
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
