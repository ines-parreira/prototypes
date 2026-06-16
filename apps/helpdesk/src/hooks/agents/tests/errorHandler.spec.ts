import { createElement } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { handleError } from '../errorHandler'

const renderErrorHandler = async (
    error: unknown,
    defaultMsg: string,
    title?: string,
) => {
    const { user } = render(
        createElement(
            'button',
            { onClick: () => handleError(error, defaultMsg, title) },
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
                response: { data: { error: { msg: message } } },
                isAxiosError: true,
            },
            '',
        )
        const toastEl = await screen.findByRole('status', { name: message })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('shows default error message', async () => {
        const message = 'default message'
        await renderErrorHandler(
            {
                response: undefined,
            },
            message,
        )
        const toastEl = await screen.findByRole('status', { name: message })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('shows default error message with title', async () => {
        const message = 'default message'
        const title = 'title'

        await renderErrorHandler(
            {
                response: undefined,
            },
            message,
            title,
        )

        const toastEl = await screen.findByRole('status', { name: title })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        expect(toastEl).toHaveTextContent(message)
    })
})
