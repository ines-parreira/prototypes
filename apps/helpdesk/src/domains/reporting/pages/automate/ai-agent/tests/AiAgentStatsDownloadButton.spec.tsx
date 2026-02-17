import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import { fireEvent, render, screen } from '@testing-library/react'

import { useAIAgentReportMetrics } from 'domains/reporting/hooks/automate/useAIAgentReportMetrics'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { AiAgentStatsDownloadButton } from 'domains/reporting/pages/automate/ai-agent/AiAgentStatsDownloadButton'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'
import useAppSelector from 'hooks/useAppSelector'

jest.mock('domains/reporting/hooks/automate/useAIAgentReportMetrics')
const useAIAgentReportMetricsMock = assumeMock(useAIAgentReportMetrics)

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    saveZippedFiles: jest.fn(),
    saveFileAsDownloaded: jest.fn(),
    saveBlobAsDownloaded: jest.fn(),
    createCsv: jest.fn(),
    getText: jest.fn(),
    getBase64: jest.fn(),
    getFileTooLargeError: jest.fn(),
}))
const saveZippedFilesMock = assumeMock(saveZippedFiles)

jest.mock('@repo/logging')
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
