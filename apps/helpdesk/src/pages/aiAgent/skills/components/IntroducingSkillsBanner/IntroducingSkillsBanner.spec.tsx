import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { IntroducingSkillsBanner } from './IntroducingSkillsBanner'

const SHOP_NAME = 'test-shop'
const DISMISSED_KEY = `introducing-skills-banner-dismissed-${SHOP_NAME}`

describe('IntroducingSkillsBanner', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('renders the banner by default', () => {
        render(<IntroducingSkillsBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('heading', {
                name: /introducing skills - precise control over your most common conversations/i,
            }),
        ).toBeInTheDocument()
    })

    it('renders the "New" tag', () => {
        render(<IntroducingSkillsBanner shopName={SHOP_NAME} />)

        expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('renders the description text', () => {
        render(<IntroducingSkillsBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByText(
                /Skills give you control over how AI Agent handles each type of conversation/i,
            ),
        ).toBeInTheDocument()
    })

    it('renders a close button', () => {
        render(<IntroducingSkillsBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('button', { name: /dismiss/i }),
        ).toBeInTheDocument()
    })

    it('hides the banner after clicking the close button', async () => {
        const user = userEvent.setup()
        render(<IntroducingSkillsBanner shopName={SHOP_NAME} />)

        await user.click(screen.getByRole('button', { name: /dismiss/i }))

        expect(
            screen.queryByRole('heading', { name: /introducing skills/i }),
        ).not.toBeInTheDocument()
    })

    it('persists dismissal in localStorage after closing', async () => {
        const user = userEvent.setup()
        render(<IntroducingSkillsBanner shopName={SHOP_NAME} />)

        await user.click(screen.getByRole('button', { name: /dismiss/i }))

        expect(localStorage.getItem(DISMISSED_KEY)).toBe('true')
    })

    it('does not render when already dismissed in localStorage', () => {
        localStorage.setItem(DISMISSED_KEY, 'true')

        render(<IntroducingSkillsBanner shopName={SHOP_NAME} />)

        expect(
            screen.queryByRole('heading', { name: /introducing skills/i }),
        ).not.toBeInTheDocument()
    })

    it('dismissal is scoped to the shopName', () => {
        localStorage.setItem(
            'introducing-skills-banner-dismissed-other-shop',
            'true',
        )

        render(<IntroducingSkillsBanner shopName={SHOP_NAME} />)

        expect(
            screen.getByRole('heading', {
                name: /introducing skills/i,
            }),
        ).toBeInTheDocument()
    })
})
