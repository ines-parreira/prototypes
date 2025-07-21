import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'
import {
    DOWNLOAD_BUTTON_TITLE,
    DownloadSLAsDataButton,
} from 'domains/reporting/pages/sla/components/DownloadSLAsDataButton'

describe('DownloadSLAsDataButton', () => {
    it('should render the button with the correct title and label', () => {
        const { getByRole } = render(
            <DownloadSLAsDataButton disabled={false} onClick={() => {}} />,
        )

        const button = getByRole('button')

        expect(button.title).toBe(DOWNLOAD_BUTTON_TITLE)
        expect(button.querySelector('span')).toHaveTextContent(
            DOWNLOAD_DATA_BUTTON_LABEL,
        )
    })

    it('should call the onClick function when the button is clicked', () => {
        const onClick = jest.fn()
        const { getByRole } = render(
            <DownloadSLAsDataButton disabled={false} onClick={onClick} />,
        )

        const button = getByRole('button')

        fireEvent.click(button)

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
        const { getByRole } = render(
            <DownloadSLAsDataButton disabled={true} onClick={() => {}} />,
        )
        const button = getByRole('button')

        expect(button).toBeAriaDisabled()
    })
})
