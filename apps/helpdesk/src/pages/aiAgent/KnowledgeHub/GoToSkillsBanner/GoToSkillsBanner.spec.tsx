import { render, screen } from '@testing-library/react'
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

const renderComponent = () =>
    render(
        <MemoryRouter>
            <ThemeProvider>
                <GoToSkillsBanner shopName={SHOP_NAME} />
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
            screen.getByRole('heading', {
                name: /take control of how ai agent handles specific conversations/i,
            }),
        ).toBeInTheDocument()
    })

    it('renders the "Go to skills" and "Learn more" buttons', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /go to skills/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /learn more/i }),
        ).toBeInTheDocument()
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
            screen.queryByRole('heading', {
                name: /take control of how ai agent handles specific conversations/i,
            }),
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
            screen.queryByRole('heading', {
                name: /take control of how ai agent handles specific conversations/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('dismissal is scoped to the shopName', () => {
        localStorage.setItem('go-to-skills-banner-dismissed-other-shop', 'true')

        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: /take control of how ai agent handles specific conversations/i,
            }),
        ).toBeInTheDocument()
    })
})
