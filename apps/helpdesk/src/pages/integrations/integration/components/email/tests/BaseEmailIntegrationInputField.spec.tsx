import React from 'react'

import { assumeMock, render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import copy from 'copy-to-clipboard'

import { BaseEmailIntegrationInputField } from '../BaseEmailIntegrationInputField'

window.GORGIAS_STATE = {
    integrations: {
        authentication: {
            email: {
                forwarding_email_address: 'acme123@email.gorgias.com',
            },
        },
    },
} as any

jest.mock('copy-to-clipboard')
const copyMock = assumeMock(copy)

describe('<BaseEmailIntegrationInputField />', () => {
    it('should render', () => {
        render(<BaseEmailIntegrationInputField />)

        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(screen.getByRole('textbox').getAttribute('value')).toBe(
            'acme123@email.gorgias.com',
        )
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    })

    it('should render with label', () => {
        render(
            <BaseEmailIntegrationInputField label="Your Base Email Address" />,
        )

        expect(screen.getByText('Your Base Email Address')).toBeInTheDocument()
    })

    it('should copy the value when clicking on the auxiliary button', async () => {
        render(<BaseEmailIntegrationInputField />)

        fireEvent.click(screen.getByRole('button', { name: 'Copy' }))

        expect(copyMock).toHaveBeenCalledWith('acme123@email.gorgias.com')

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Address copied to clipboard',
            })
            expect(toast).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should display an error notification when copying fails', async () => {
        render(<BaseEmailIntegrationInputField />)

        copyMock.mockImplementationOnce(() => {
            throw new Error('copy failed')
        })

        fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
        expect(copyMock).toHaveBeenCalledWith('acme123@email.gorgias.com')

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Failed to copy address',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it("shouldn't render in case the base address is missing", () => {
        window.GORGIAS_STATE = {} as any
        render(<BaseEmailIntegrationInputField />)

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
})
