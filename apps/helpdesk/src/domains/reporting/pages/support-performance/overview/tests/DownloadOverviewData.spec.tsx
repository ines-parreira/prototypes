import { useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { fireEvent, render } from '@testing-library/react'

import { useDownloadOverViewData } from 'domains/reporting/hooks/support-performance/overview/useDownloadOverviewData'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'
import { DownloadOverviewData } from 'domains/reporting/pages/support-performance/overview/DownloadOverviewData'
import { saveZippedFiles } from 'utils/file'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('@repo/logging')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock(
    'domains/reporting/hooks/support-performance/overview/useDownloadOverviewData',
)
const useDownloadOverViewDataMock = assumeMock(useDownloadOverViewData)
jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

describe('DownloadOverviewData', () => {
    const reportFileName = 'someFileName'
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
        useDownloadOverViewDataMock.mockReturnValue({
            files: {},
            fileName: 'someFileName',
            isLoading: false,
        })
    })

    it('should send event to segment and call saveReport on download data button click', () => {
        const { getByText } = render(<DownloadOverviewData />)
        fireEvent.click(getByText(DOWNLOAD_DATA_BUTTON_LABEL))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDownloadClicked,
            expect.objectContaining({
                name: 'all-metrics',
            }),
        )
        expect(saveZippedFilesMock).toHaveBeenCalledWith({}, reportFileName)
    })

    describe('AnalyticsDeferredLoadingExperiment', () => {
        it('should call data hooks with deferred fetching enabled when the flag is off', () => {
            useFlagMock.mockReturnValue(false)

            render(<DownloadOverviewData />)

            expect(useDownloadOverViewDataMock).toHaveBeenCalledWith(true)
        })

        it('should call data hooks with deferred fetching disabled when the flag is on', () => {
            useFlagMock.mockReturnValue(true)

            render(<DownloadOverviewData />)

            expect(useDownloadOverViewDataMock).toHaveBeenCalledWith(false)
        })
    })
})
