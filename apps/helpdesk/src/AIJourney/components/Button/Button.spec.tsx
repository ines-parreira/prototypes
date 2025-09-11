import React from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { Button } from './Button'

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({
        to,
        children,
        ...props
    }: {
        to: string
        children: React.ReactNode
    }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('<Button />', () => {
    describe('primary variation', () => {
        it('should render the clickable button when enabled', async () => {
            const onClick = jest.fn()

            render(<Button label="Click me" onClick={onClick} />)
            expect(screen.getByText('Click me')).toBeInTheDocument()

            const button = screen.getByRole('button')
            await userEvent.click(button)

            expect(onClick).toHaveBeenCalledTimes(1)
        })

        it('should not call onClick when disabled', async () => {
            const onClick = jest.fn()

            render(<Button label="Click me" onClick={onClick} isDisabled />)

            const button = screen.getByRole('button')

            expect(button).toBeDisabled()

            await userEvent.click(button)

            expect(onClick).not.toHaveBeenCalled()
        })
    })

    describe('secondary variation', () => {
        it('should render the clickable button when enabled', async () => {
            const onClick = jest.fn()

            render(
                <Button
                    label="Click me"
                    onClick={onClick}
                    variant="secondary"
                />,
            )
            expect(screen.getByText('Click me')).toBeInTheDocument()

            const button = screen.getByRole('button')
            await userEvent.click(button)

            expect(onClick).toHaveBeenCalledTimes(1)
        })

        it('should not call onClick when disabled', async () => {
            const onClick = jest.fn()

            render(
                <Button
                    label="Click me"
                    onClick={onClick}
                    variant="secondary"
                    isDisabled
                />,
            )
            const button = screen.getByRole('button')

            expect(button).toBeDisabled()

            await userEvent.click(button)

            expect(onClick).not.toHaveBeenCalled()
        })
    })

    describe('link variation', () => {
        it('should render the clickable button when enabled', async () => {
            render(
                <Button label="Click me" variant="link" redirectLink="/href" />,
            )
            expect(screen.getByText('Click me')).toBeInTheDocument()

            const link = screen.getByRole('link', { name: 'Click me' })

            expect(link).toHaveAttribute('href', '/href')
            expect(link).not.toBeDisabled()

            await userEvent.click(link)
        })

        it('should render iconLeft prop when passed', async () => {
            render(
                <Button
                    label="Click me"
                    variant="link"
                    redirectLink="/href"
                    iconLeft="sd_storage"
                />,
            )

            expect(screen.getByText('sd_storage')).toBeInTheDocument()
        })

        it('should ignore isDisabled prop', async () => {
            render(
                <Button
                    label="Click me"
                    variant="link"
                    redirectLink="/href"
                    isDisabled
                />,
            )
            expect(screen.getByText('Click me')).toBeInTheDocument()

            const link = screen.getByRole('link', { name: 'Click me' })

            expect(link).not.toBeDisabled()
        })
    })
})
