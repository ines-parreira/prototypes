import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'

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
