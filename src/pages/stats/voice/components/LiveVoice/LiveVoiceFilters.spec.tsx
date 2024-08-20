import React from 'react'
import {render, cleanup, screen} from '@testing-library/react'
import * as uiStatsSelectors from 'state/ui/stats/selectors'
import * as statsSelectors from 'state/stats/selectors'
import * as integrationsSelectors from 'state/integrations/selectors'

import LiveVoiceFilters from './LiveVoiceFilters'

jest.mock('pages/stats/common/filters/IntegrationsFilter', () => () => (
    <div>IntegrationsFilter</div>
))
jest.mock('pages/stats/common/filters/AgentsFilter', () => () => (
    <div>AgentsFilter</div>
))
jest.mock('hooks/reporting/useCleanStatsFilters')
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.spyOn(
    uiStatsSelectors,
    'getCleanStatsFiltersWithTimezone'
).mockReturnValue({
    cleanStatsFilters: {} as any,
} as any)
jest.spyOn(statsSelectors, 'getPageStatsFilters').mockReturnValue({} as any)
jest.spyOn(integrationsSelectors, 'getPhoneIntegrations').mockReturnValue([])

describe('LiveVoiceFilters', () => {
    const renderComponent = () => render(<LiveVoiceFilters />)

    afterEach(cleanup)

    it('should render integrations and agents filter', () => {
        renderComponent()
        expect(screen.getByText('IntegrationsFilter')).toBeInTheDocument()
        expect(screen.getByText('AgentsFilter')).toBeInTheDocument()
    })
})
