import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { useAIAgentReportMetrics } from 'hooks/reporting/automate/useAIAgentReportMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { StatsFiltersWithLogicalOperator } from 'models/stat/types'
import { AiAgentStatsDownloadButton } from 'pages/stats/automate/ai-agent/AiAgentStatsDownloadButton'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'pages/stats/constants'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/automate/useAIAgentReportMetrics')
const useAIAgentReportMetricsMock = assumeMock(useAIAgentReportMetrics)

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('AiAgentStatsDownloadButton', () => {
    const selectedCustomFieldId = 123
    const statsFiltersMock: StatsFiltersWithLogicalOperator = {
        period: {
            start_datetime: '2024-09-14T00:00:00+00:00',
            end_datetime: '2024-09-20T23:59:59+00:00',
        },
        agents: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [5],
        },
    }

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(statsFiltersMock)
        useAIAgentReportMetricsMock.mockReturnValue({
            files: 'files',
            fileName: 'fileName',
            isLoading: false,
        } as any)
    })

    it('should call logEvent & saveReport on click', () => {
        render(
            <AiAgentStatsDownloadButton
                selectedCustomFieldId={selectedCustomFieldId}
            />,
        )

        fireEvent.click(screen.getByText(DOWNLOAD_DATA_BUTTON_LABEL))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            {
                name: 'all-metrics',
            },
        )

        expect(saveZippedFilesMock).toHaveBeenCalledWith('files', 'fileName')
    })

    it('should not call logEvent & saveReport on click if loading is true', () => {
        useAIAgentReportMetricsMock.mockReturnValue({
            files: 'files',
            fileName: 'fileName',
            isLoading: true,
        } as any)

        render(
            <AiAgentStatsDownloadButton
                selectedCustomFieldId={selectedCustomFieldId}
            />,
        )

        fireEvent.click(screen.getByText(DOWNLOAD_DATA_BUTTON_LABEL))

        expect(logEventMock).not.toHaveBeenCalled()
        expect(saveZippedFilesMock).not.toHaveBeenCalled()
    })
})
