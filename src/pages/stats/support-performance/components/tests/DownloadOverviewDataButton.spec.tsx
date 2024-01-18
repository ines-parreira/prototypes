import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {DownloadOverviewDataButton} from 'pages/stats/support-performance/components/DownloadOverviewDataButton'

describe('DownloadOverviewData', () => {
    it('should be disabled', () => {
        render(
            <DownloadOverviewDataButton onClick={jest.fn()} disabled={true} />
        )
        const button = screen.getByRole('button')

        expect(button).toHaveAttribute('aria-disabled', 'true')
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
