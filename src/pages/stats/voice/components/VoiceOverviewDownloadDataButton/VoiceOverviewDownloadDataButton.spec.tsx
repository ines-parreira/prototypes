import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'

import {agents} from 'fixtures/agents'
import {tags} from 'fixtures/tag'
import {ReportingGranularity} from 'models/reporting/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {VoiceOverviewDownloadDataButton} from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'

import {saveReport} from 'services/reporting/voiceOverviewReportingService'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/voice/hooks/useVoiceCallCountTrend')
const useVoiceCallCountTrendMock = assumeMock(useVoiceCallCountTrend)
jest.mock('pages/stats/voice/hooks/useVoiceCallAverageTimeTrend')
const useVoiceCallAverageTimeTrendMock = assumeMock(
    useVoiceCallAverageTimeTrend
)
jest.mock('services/reporting/voiceOverviewReportingService')
const mockSaveReport = assumeMock(saveReport)
jest.mock('pages/stats/voice/hooks/useNewVoiceStatsFilters')
const useNewVoiceStatsFiltersMock = assumeMock(useNewVoiceStatsFilters)

describe('VoiceOverviewDownloadDataButton', () => {
    const statsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2023-12-11T00:00:00.000Z',
            end_datetime: '2023-12-11T23:59:59.999Z',
        },
        agents: [agents[0].id],
        tags: [tags[0].id],
    }

    beforeEach(() => {
        useVoiceCallCountTrendMock.mockReturnValue({
            data: {prevValue: 10, value: 15},
            isFetching: false,
            isError: false,
        })
        useVoiceCallAverageTimeTrendMock.mockReturnValue({
            data: {prevValue: 1, value: 2},
            isFetching: false,
            isError: false,
        })
        useNewVoiceStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: fromLegacyStatsFilters(statsFilters),
            granularity: ReportingGranularity.Day,
            userTimezone: 'UTC',
            isAnalyticsNewFilters: true,
        })
    })

    const renderComponent = () => {
        return render(<VoiceOverviewDownloadDataButton />)
    }

    it('should be disabled when loading', () => {
        useVoiceCallAverageTimeTrendMock.mockReturnValue({
            data: {prevValue: 1, value: 2},
            isFetching: true,
            isError: false,
        })
        renderComponent()
        const button = screen.getByRole('button')

        expect(button).toBeAriaDisabled()
    })

    it('should call saveReport onClick', () => {
        renderComponent()
        const button = screen.getByRole('button')
        userEvent.click(button)

        expect(mockSaveReport).toHaveBeenCalledTimes(1)
    })
})
