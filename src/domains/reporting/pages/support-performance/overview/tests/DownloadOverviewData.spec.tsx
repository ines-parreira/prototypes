import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useDownloadOverViewData } from 'domains/reporting/hooks/support-performance/overview/useDownloadOverviewData'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'
import { DownloadOverviewData } from 'domains/reporting/pages/support-performance/overview/DownloadOverviewData'
import { saveZippedFiles } from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('common/segment')
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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: false,
        }))
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
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: false,
            }))

            render(<DownloadOverviewData />)

            expect(useDownloadOverViewDataMock).toHaveBeenCalledWith(true)
        })

        it('should call data hooks with deferred fetching disabled when the flag is on', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: true,
            }))

            render(<DownloadOverviewData />)

            expect(useDownloadOverViewDataMock).toHaveBeenCalledWith(false)
        })
    })
})
