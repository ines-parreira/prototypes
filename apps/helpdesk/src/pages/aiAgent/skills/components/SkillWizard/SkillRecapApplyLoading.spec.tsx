import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'

import loadingAnimation from 'assets/img/ai-agent/skill_wizard_loading.json'

import { SkillRecapApplyLoading } from './SkillRecapApplyLoading'

jest.mock('lottie-react', () => ({
    __esModule: true,
    default: jest.fn(({ animationData, ...props }) => (
        <div
            data-testid="lottie-animation"
            data-animation-data={JSON.stringify(animationData)}
            {...props}
        />
    )),
}))

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

    it('renders the loading animation hidden from assistive technology', () => {
        renderLoading('Enabling your skills...')

        const animation = screen.getByTestId('lottie-animation')

        expect(animation).toBeInTheDocument()
        expect(animation).toHaveAttribute('aria-hidden', 'true')
        expect(animation).toHaveAttribute(
            'data-animation-data',
            JSON.stringify(loadingAnimation),
        )
    })
})
