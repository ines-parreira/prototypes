import {render, screen, fireEvent, act} from '@testing-library/react'

import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useDownloadAgentsPerformanceData} from 'hooks/reporting/support-performance/agents/useDownloadAgentsPerformanceData'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'

import {DownloadAgentsPerformanceDataButton} from 'pages/stats/support-performance/agents/DownloadAgentsPerformanceDataButton'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {saveZippedFiles} from 'utils/file'
import {assumeMock} from 'utils/testing'

jest.mock(
    'hooks/reporting/support-performance/agents/useDownloadAgentsPerformanceData'
)
const useDownloadAgentsPerformanceDataMock = assumeMock(
    useDownloadAgentsPerformanceData
)
jest.mock('hooks/reporting/useAgentsTableConfigSetting')
const useAgentsTableConfigSettingMock = assumeMock(useAgentsTableConfigSetting)

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)
jest.mock('common/segment')
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
            reportData.fileName
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
        const {getByText} = render(<DownloadAgentsPerformanceDataButton />)
        act(() => {
            fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            })
        )
        expect(saveZippedFilesMock).toHaveBeenCalled()
    })
})
