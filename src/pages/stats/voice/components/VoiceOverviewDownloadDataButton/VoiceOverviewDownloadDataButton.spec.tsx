import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {VoiceOverviewDownloadDataButton} from 'pages/stats/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'

describe('VoiceOverviewDownloadDataButton', () => {
    const renderComponent = (onClick: () => void, disabled: boolean) => {
        return render(
            <VoiceOverviewDownloadDataButton
                onClick={onClick}
                disabled={disabled}
            />
        )
    }

    it('should be disabled', () => {
        renderComponent(jest.fn(), true)
        const button = screen.getByRole('button')

        expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should call onClick', () => {
        const onClickSpy = jest.fn()

        renderComponent(onClickSpy, false)
        const button = screen.getByRole('button')
        userEvent.click(button)

        expect(onClickSpy).toHaveBeenCalled()
    })
})
