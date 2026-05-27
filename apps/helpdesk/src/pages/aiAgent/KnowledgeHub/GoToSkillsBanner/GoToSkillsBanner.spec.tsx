import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { ThemeProvider } from 'core/theme'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { GoToSkillsBanner } from './GoToSkillsBanner'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(),
}))

const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock

const SHOP_NAME = 'test-shop'
const SKILLS_ROUTE = '/ai-agent/test-shop/skills'
const DISMISSED_KEY = `go-to-skills-banner-dismissed-${SHOP_NAME}`

const renderComponent = (
    props: Partial<ComponentProps<typeof GoToSkillsBanner>> = {},
) =>
    render(
        <MemoryRouter>
            <ThemeProvider>
                <GoToSkillsBanner shopName={SHOP_NAME} {...props} />
            </ThemeProvider>
        </MemoryRouter>,
    )

describe('GoToSkillsBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        mockUseAiAgentNavigation.mockReturnValue({
            routes: { skills: SKILLS_ROUTE },
        })
    })

    it('renders the banner by default', () => {
        renderComponent()

        expect(
            screen.getByText(
                /Skills are here: your recommendations are ready to review/i,
            ),
        ).toBeInTheDocument()
    })

    it('renders the "Go to skills" button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /go to skills/i }),
        ).toBeInTheDocument()
    })

    it('renders custom title, description, and width when provided', () => {
        const { container } = renderComponent({
            title: 'Skills are here: review and enable your recommendations',
            description:
                'We created the core set of skills your AI Agent needs.',
            width: 'fit-content',
        })

        expect(
            screen.getByText(
                'Skills are here: review and enable your recommendations',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'We created the core set of skills your AI Agent needs.',
            ),
        ).toBeInTheDocument()
        expect(container.firstElementChild).toHaveStyle({
            width: 'fit-content',
        })
    })

    it('renders the close button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /close/i }),
        ).toBeInTheDocument()
    })

    it('hides the banner after clicking the close button', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /close/i }))

        expect(
            screen.queryByText(
                /Skills are here: your recommendations are ready to review/i,
            ),
        ).not.toBeInTheDocument()
    })

    it('persists dismissal in localStorage after closing', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /close/i }))

        expect(localStorage.getItem(DISMISSED_KEY)).toBe('true')
    })

    it('does not render when already dismissed in localStorage', () => {
        localStorage.setItem(DISMISSED_KEY, 'true')

        renderComponent()

        expect(
            screen.queryByText(
                /Skills are here: your recommendations are ready to review/i,
            ),
        ).not.toBeInTheDocument()
    })

    it('dismissal is scoped to the shopName', () => {
        localStorage.setItem('go-to-skills-banner-dismissed-other-shop', 'true')

        renderComponent()

        expect(
            screen.getByText(
                /Skills are here: your recommendations are ready to review/i,
            ),
        ).toBeInTheDocument()
    })
})
