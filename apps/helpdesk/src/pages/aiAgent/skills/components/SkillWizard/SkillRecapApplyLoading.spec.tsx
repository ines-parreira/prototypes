import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'

import { SkillRecapApplyLoading } from './SkillRecapApplyLoading'

const renderLoading = (message: string) =>
    render(
        <ThemeProvider>
            <SkillRecapApplyLoading message={message} />
        </ThemeProvider>,
    )

describe('SkillRecapApplyLoading', () => {
    it('renders the provided message as visible text', () => {
        renderLoading('Enabling your skills...')

        expect(screen.getByText('Enabling your skills...')).toBeInTheDocument()
    })

    it('exposes the message via an aria-live status region for assistive tech', () => {
        renderLoading('Disabling guidance...')

        expect(
            screen.getByRole('status', { name: 'Disabling guidance...' }),
        ).toBeInTheDocument()
    })

    it('updates the announced message when the message prop changes', () => {
        const { rerender } = renderLoading('Enabling your skills...')

        expect(
            screen.getByRole('status', { name: 'Enabling your skills...' }),
        ).toBeInTheDocument()

        rerender(
            <ThemeProvider>
                <SkillRecapApplyLoading message="Disabling guidance..." />
            </ThemeProvider>,
        )

        expect(
            screen.getByRole('status', { name: 'Disabling guidance...' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Enabling your skills...'),
        ).not.toBeInTheDocument()
    })
})
