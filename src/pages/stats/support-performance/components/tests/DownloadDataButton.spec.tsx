import React from 'react'

import { render, screen } from '@testing-library/react'

import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { userEvent } from 'utils/testing/userEvent'

describe('DownloadOverviewData', () => {
    it('should be disabled', () => {
        render(
            <DownloadDataButton
                onClick={jest.fn()}
                disabled={true}
                title="some title"
            />,
        )
        const button = screen.getByRole('button')

        expect(button).toBeAriaDisabled()
    })

    it('should call onClick', () => {
        const onClickSpy = jest.fn()

        render(
            <DownloadDataButton
                onClick={onClickSpy}
                disabled={false}
                title={'some title'}
            />,
        )
        const button = screen.getByRole('button')
        userEvent.click(button)

        expect(onClickSpy).toHaveBeenCalled()
    })
})
