import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {DownloadDataButton} from 'pages/stats/support-performance/components/DownloadDataButton'

describe('DownloadOverviewData', () => {
    it('should be disabled', () => {
        render(<DownloadDataButton onClick={jest.fn()} disabled={true} />)
        const button = screen.getByRole('button')

        expect(button).toBeAriaDisabled()
    })

    it('should call onClick', () => {
        const onClickSpy = jest.fn()

        render(<DownloadDataButton onClick={onClickSpy} disabled={false} />)
        const button = screen.getByRole('button')
        userEvent.click(button)

        expect(onClickSpy).toHaveBeenCalled()
    })
})
