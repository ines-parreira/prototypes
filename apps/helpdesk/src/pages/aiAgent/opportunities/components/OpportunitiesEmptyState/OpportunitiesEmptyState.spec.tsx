import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { State } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'

import { OpportunitiesEmptyState } from './OpportunitiesEmptyState'

const mockOpportunityPageState: OpportunityPageState = {
    state: State.ENABLED_NO_OPPORTUNITIES,
    isLoading: false,
    title: 'AI Agent is learning from your conversations',
    description:
        "As AI Agent handles more conversations, we'll surface opportunities to improve its accuracy and coverage. Check back soon!",
    media: 'ai-agent-scan.gif',
    primaryCta: null,
    showEmptyState: true,
}

describe('OpportunitiesEmptyState', () => {
    const renderComponent = (
        opportunitiesPageState: OpportunityPageState = mockOpportunityPageState,
    ) => {
        const history = createMemoryHistory()
        return {
            history,
            ...render(
                <Router history={history}>
                    <OpportunitiesEmptyState
                        opportunitiesPageState={opportunitiesPageState}
                    />
                </Router>,
            ),
        }
    }

    it('should render the title', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: 'AI Agent is learning from your conversations',
            }),
        ).toBeInTheDocument()
    })

    it('should render the description', () => {
        renderComponent()

        expect(
            screen.getByText(
                /As AI Agent handles more conversations, we'll surface opportunities/,
            ),
        ).toBeInTheDocument()
    })

    it('should not render primary CTA button when not provided', () => {
        renderComponent()

        expect(
            screen.queryByRole('button', { name: /enable/i }),
        ).not.toBeInTheDocument()
    })

    it('should render primary CTA button when provided', () => {
        const stateWithCta: OpportunityPageState = {
            ...mockOpportunityPageState,
            primaryCta: {
                label: 'Enable AI Agent',
                href: '/app/ai-agent/shopify/test-shop/deploy/email',
            },
        }

        renderComponent(stateWithCta)

        expect(
            screen.getByRole('button', { name: 'Enable AI Agent' }),
        ).toBeInTheDocument()
    })

    it('should navigate to correct path when CTA button is clicked', async () => {
        const user = userEvent.setup()
        const ctaHref = '/app/ai-agent/shopify/test-shop/deploy/email'
        const stateWithCta: OpportunityPageState = {
            ...mockOpportunityPageState,
            primaryCta: {
                label: 'Enable AI Agent',
                href: ctaHref,
            },
        }

        const { history } = renderComponent(stateWithCta)

        const button = screen.getByRole('button', { name: 'Enable AI Agent' })
        await user.click(button)

        expect(history.location.pathname).toBe(ctaHref)
    })

    it('should not navigate when CTA button is clicked without href', async () => {
        const user = userEvent.setup()
        const stateWithCtaWithoutHref: OpportunityPageState = {
            ...mockOpportunityPageState,
            primaryCta: {
                label: 'Complete setup',
            },
        }

        const { history } = renderComponent(stateWithCtaWithoutHref)
        const initialPath = history.location.pathname

        const button = screen.getByRole('button', { name: 'Complete setup' })
        await user.click(button)

        expect(history.location.pathname).toBe(initialPath)
    })

    it('should render media image when media is provided', () => {
        renderComponent()

        const image = screen.getByAltText('Opportunities empty state')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', 'ai-agent-scan.gif')
    })

    it('should not render media frame when media is not provided', () => {
        const stateWithoutMedia: OpportunityPageState = {
            ...mockOpportunityPageState,
            media: null,
        }

        renderComponent(stateWithoutMedia)

        expect(
            screen.queryByAltText('Opportunities empty state'),
        ).not.toBeInTheDocument()
    })
})
