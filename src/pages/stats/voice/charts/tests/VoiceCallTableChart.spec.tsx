import React from 'react'

import { screen } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { ReportingGranularity } from 'models/reporting/types'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock, mockStore } from 'utils/testing'

import VoiceCallDirectionFilter from '../../components/VoiceCallDirectionFilter/VoiceCallDirectionFilter'
import VoiceCallFilter from '../../components/VoiceCallFilter/VoiceCallFilter'
import { VoiceCallTable } from '../../components/VoiceCallTable/VoiceCallTable'
import { useNewVoiceStatsFilters } from '../../hooks/useNewVoiceStatsFilters'
import { VoiceCallFilterDirection } from '../../models/types'
import { VoiceCallTableChart } from '../VoiceCallTableChart'

jest.mock('core/flags')
jest.mock(
    'pages/stats/voice/components/VoiceCallDirectionFilter/VoiceCallDirectionFilter',
)
jest.mock('pages/stats/voice/components/VoiceCallFilter/VoiceCallFilter')
jest.mock('pages/stats/voice/components/VoiceCallTable/VoiceCallTable')
jest.mock('pages/stats/voice/hooks/useNewVoiceStatsFilters')

const useFlagMock = assumeMock(useFlag)
const VoiceCallDirectionFilterMock = assumeMock(VoiceCallDirectionFilter)
const VoiceCallFilterMock = assumeMock(VoiceCallFilter)
const VoiceCallTableMock = assumeMock(VoiceCallTable)
const useNewVoiceStatsFiltersMock = assumeMock(useNewVoiceStatsFilters)

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
        VoiceCallDirectionFilterMock.mockReturnValue(
            <div data-testid="voice-call-direction-filter" />,
        )
        VoiceCallFilterMock.mockReturnValue(
            <div data-testid="voice-call-filter" />,
        )
        VoiceCallTableMock.mockReturnValue(
            <div data-testid="voice-call-table" />,
        )
        useNewVoiceStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            granularity: ReportingGranularity.Day,
            userTimezone: userTimezone,
            isAnalyticsNewFilters: true,
        })
    })

    it('renders VoiceCallTableChart with VoiceCallDirectionFilter when FF is off', () => {
        const selectedFilter = {
            direction: VoiceCallFilterDirection.Inbound,
        }

        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return false
            }
        })

        renderComponent()

        expect(screen.getByTestId('voice-call-table')).toBeInTheDocument()
        expect(
            screen.getByTestId('voice-call-direction-filter'),
        ).toBeInTheDocument()

        act(() =>
            VoiceCallDirectionFilterMock.mock.calls[0][0].onFilterSelect(
                selectedFilter,
            ),
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

    it('renders VoiceCallTableChart with VoiceCallFilter when FF is on', () => {
        const selectedFilter = {
            direction: VoiceCallFilterDirection.Inbound,
        }

        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return true
            }
        })

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
