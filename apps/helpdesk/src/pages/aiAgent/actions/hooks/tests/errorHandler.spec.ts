import { createElement } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { handleError } from '../errorHandler'

const renderErrorHandler = async (error: unknown, message: string) => {
    const { user } = render(
        createElement(
            'button',
            { onClick: () => handleError(error, message) },
            'Show',
        ),
    )
    await user.click(screen.getByRole('button', { name: 'Show' }))
}

describe('handleError', () => {
    it('shows the provided error message', async () => {
        const message = 'test error'
        await renderErrorHandler(
            {
                response: { data: { message } },
                isAxiosError: true,
            },
            '',
        )
        expect(
            await screen.findByRole('status', { name: message }),
        ).toBeInTheDocument()
    })

    it('shows default error message', async () => {
        const message = 'default message'
        await renderErrorHandler(
            {
                response: undefined,
            },
            message,
        )
        expect(
            await screen.findByRole('status', { name: message }),
        ).toBeInTheDocument()
    })

    it('shows duplicate name error', async () => {
        const message = 'default message'
        const error = {
            response: { status: 409 },
            isAxiosError: true,
        }

        await renderErrorHandler(error, message)

        expect(
            await screen.findByRole('status', {
                name: 'An Action with this name already exists. Choose a unique name in order to save.',
            }),
        ).toBeInTheDocument()
    })
})
