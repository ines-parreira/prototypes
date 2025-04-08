import { screen } from '@testing-library/react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'

import '@testing-library/jest-dom/extend-expect'

import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'

import { ReportingGranularity } from 'models/reporting/types'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock, mockStore } from 'utils/testing'

import VoiceCallFilter from '../../components/VoiceCallFilter/VoiceCallFilter'
import { VoiceCallTable } from '../../components/VoiceCallTable/VoiceCallTable'
import { VoiceCallFilterDirection } from '../../models/types'
import { VoiceCallTableChart } from '../VoiceCallTableChart'

jest.mock('pages/stats/voice/components/VoiceCallFilter/VoiceCallFilter')
jest.mock('pages/stats/voice/components/VoiceCallTable/VoiceCallTable')

const VoiceCallFilterMock = assumeMock(VoiceCallFilter)
const VoiceCallTableMock = assumeMock(VoiceCallTable)
jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

const defaultProps: DashboardChartProps = {
    chartId: 'test-chart-id',
}

const renderComponent = () => {
    return renderWithQueryClientProvider(
        <Provider store={mockStore({})}>
            <VoiceCallTableChart {...defaultProps} />
        </Provider>,
    )
}

const filters = {
    period: {
        start_datetime: '2023-12-11T00:00:00.000Z',
        end_datetime: '2023-12-11T23:59:59.999Z',
    },
}
const userTimezone = 'UTC'

describe('VoiceCallTableChart', () => {
    beforeEach(() => {
        VoiceCallFilterMock.mockReturnValue(
            <div data-testid="voice-call-filter" />,
        )
        VoiceCallTableMock.mockReturnValue(
            <div data-testid="voice-call-table" />,
        )
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            granularity: ReportingGranularity.Day,
            userTimezone: userTimezone,
        })
    })

    it('renders VoiceCallTableChart with VoiceCallFilter', () => {
        const selectedFilter = {
            direction: VoiceCallFilterDirection.Inbound,
        }

        renderComponent()

        expect(screen.getByTestId('voice-call-table')).toBeInTheDocument()
        expect(screen.getByTestId('voice-call-filter')).toBeInTheDocument()

        act(() =>
            VoiceCallFilterMock.mock.calls[0][0].onFilterSelect(selectedFilter),
        )
        expect(VoiceCallTableMock).toHaveBeenCalledWith(
            {
                statsFilters: filters,
                userTimezone: userTimezone,
                filterOption: selectedFilter,
            },
            {},
        )
    })
})
