import {fireEvent, render, screen} from '@testing-library/react'
import copy from 'copy-to-clipboard'
import React from 'react'

import {notify} from 'state/notifications/actions'
import {assumeMock} from 'utils/testing'

import BaseEmailIntegrationInputField from '../BaseEmailIntegrationInputField'

window.GORGIAS_STATE = {
    integrations: {
        authentication: {
            email: {
                forwarding_email_address: 'acme123@email.gorgias.com',
            },
        },
    },
} as any

jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('state/notifications/actions')
jest.mock('copy-to-clipboard')
const copyMock = assumeMock(copy)

describe('<BaseEmailIntegrationInputField />', () => {
    it('should render', () => {
        render(<BaseEmailIntegrationInputField />)

        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(screen.getByRole('textbox').getAttribute('value')).toBe(
            'acme123@email.gorgias.com'
        )
        expect(
            screen.getByRole('button', {name: 'Copy content_copy'})
        ).toBeInTheDocument()
    })

    it('should render with label', () => {
        render(
            <BaseEmailIntegrationInputField label="Your Base Email Address" />
        )

        expect(screen.getByText('Your Base Email Address')).toBeInTheDocument()
    })

    it('should copy the value when clicking on the auxiliary button', () => {
        render(<BaseEmailIntegrationInputField />)

        fireEvent.click(screen.getByRole('button', {name: 'Copy content_copy'}))

        expect(copyMock).toHaveBeenCalledWith('acme123@email.gorgias.com')

        expect(notify).toHaveBeenCalledWith({
            status: 'success',
            title: 'Address copied to clipboard',
        })
    })

    it('should display an error notification when copying fails', () => {
        render(<BaseEmailIntegrationInputField />)

        copyMock.mockImplementationOnce(() => {
            throw new Error('copy failed')
        })

        fireEvent.click(screen.getByRole('button', {name: 'Copy content_copy'}))
        expect(copyMock).toHaveBeenCalledWith('acme123@email.gorgias.com')

        expect(notify).toHaveBeenCalledWith({
            status: 'error',
            title: 'Failed to copy address',
        })
    })

    it("shouldn't render in case the base address is missing", () => {
        window.GORGIAS_STATE = {} as any
        render(<BaseEmailIntegrationInputField />)

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
})
