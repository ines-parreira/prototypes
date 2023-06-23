import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {DownloadOverviewDataButton} from 'pages/stats/DownloadOverviewDataButton'

jest.mock('utils/file')
jest.mock('services/reporting/supportPerformanceReportingService')

describe('DownloadOverviewData', () => {
    it('should be disabled', () => {
        render(
            <DownloadOverviewDataButton onClick={jest.fn()} disabled={true} />
        )
        const button = screen.getByRole('button')

        expect(button).toBeDisabled()
    })

    it('should call onClick', () => {
        const onClickSpy = jest.fn()

        render(
            <DownloadOverviewDataButton onClick={onClickSpy} disabled={false} />
        )
        const button = screen.getByRole('button')
        userEvent.click(button)

        expect(onClickSpy).toHaveBeenCalled()
    })
})
