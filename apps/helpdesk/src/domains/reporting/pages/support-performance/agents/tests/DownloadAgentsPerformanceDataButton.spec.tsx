import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { saveZippedFiles } from '@repo/utils'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { useDownloadAgentsPerformanceData } from 'domains/reporting/hooks/support-performance/agents/useDownloadAgentsPerformanceData'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'
import { DownloadAgentsPerformanceDataButton } from 'domains/reporting/pages/support-performance/agents/DownloadAgentsPerformanceDataButton'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'

jest.mock(
    'domains/reporting/hooks/support-performance/agents/useDownloadAgentsPerformanceData',
)
const useDownloadAgentsPerformanceDataMock = assumeMock(
    useDownloadAgentsPerformanceData,
)
jest.mock('domains/reporting/hooks/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)

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

describe('DownloadAgentsPerformanceDataButton', () => {
    const columnsOrder = Object.values(AgentsTableColumn)
    const reportData = {
        files: {
            ['someName']: 'data',
        },
        fileName: 'someFileName',
        isLoading: false,
    }

    beforeEach(() => {
        useAgentsTableConfigSettingMock.mockReturnValue({
            columnsOrder: columnsOrder,
        } as any)
        useDownloadAgentsPerformanceDataMock.mockReturnValue(reportData)
    })

    it('should render', () => {
        render(<DownloadAgentsPerformanceDataButton />)

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call saveReport on click', () => {
        render(<DownloadAgentsPerformanceDataButton />)

        fireEvent.click(screen.getByRole('button'))

        expect(saveZippedFilesMock).toHaveBeenCalledWith(
            reportData.files,
            reportData.fileName,
        )
    })

    it('should be disabled', () => {
        useDownloadAgentsPerformanceDataMock.mockReturnValue({
            ...reportData,
            isLoading: true,
        })

        render(<DownloadAgentsPerformanceDataButton />)

        expect(screen.getByRole('button')).toBeAriaDisabled()
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const { getByText } = render(<DownloadAgentsPerformanceDataButton />)
        act(() => {
            fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
        expect(saveZippedFilesMock).toHaveBeenCalled()
    })
})
