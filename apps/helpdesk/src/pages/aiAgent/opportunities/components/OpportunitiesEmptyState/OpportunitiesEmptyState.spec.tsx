import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { State } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'

import { OpportunitiesEmptyState } from './OpportunitiesEmptyState'

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

    it('should render media when media is provided', () => {
        renderComponent()

        const media = screen.getByRole('img', {
            name: 'Opportunities empty state',
        })
        expect(media).toBeInTheDocument()
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

    describe('Lottie animation support', () => {
        const mockLottieAnimationData = {
            v: '5.5.7',
            fr: 30,
            ip: 0,
            op: 60,
            w: 400,
            h: 400,
            nm: 'Test Animation',
            ddd: 0,
            assets: [],
            layers: [],
        }

        it('should render Lottie animation when media is an object', () => {
            const stateWithLottieMedia: OpportunityPageState = {
                ...mockOpportunityPageState,
                media: mockLottieAnimationData,
            }

            renderComponent(stateWithLottieMedia)

            const lottieElement = screen.getByTestId('lottie-animation')
            expect(lottieElement).toBeInTheDocument()
        })

        it('should pass animation data to Lottie component', () => {
            const stateWithLottieMedia: OpportunityPageState = {
                ...mockOpportunityPageState,
                media: mockLottieAnimationData,
            }

            renderComponent(stateWithLottieMedia)

            const lottieElement = screen.getByTestId('lottie-animation')
            expect(lottieElement).toHaveAttribute(
                'data-animation-data',
                JSON.stringify(mockLottieAnimationData),
            )
        })

        it('should render Lottie with correct accessibility attributes', () => {
            const stateWithLottieMedia: OpportunityPageState = {
                ...mockOpportunityPageState,
                media: mockLottieAnimationData,
            }

            renderComponent(stateWithLottieMedia)

            const lottieElement = screen.getByRole('img', {
                name: 'Opportunities empty state',
            })
            expect(lottieElement).toBeInTheDocument()
        })

        it('should not render img element when media is an object', () => {
            const stateWithLottieMedia: OpportunityPageState = {
                ...mockOpportunityPageState,
                media: mockLottieAnimationData,
            }

            const { container } = renderComponent(stateWithLottieMedia)

            const imgElement = container.querySelector('img')
            expect(imgElement).not.toBeInTheDocument()
        })

        it('should render img element when media is a string', () => {
            renderComponent()

            const imgElement = screen.getByRole('img', {
                name: 'Opportunities empty state',
            })
            expect(imgElement).toHaveAttribute('src', 'ai-agent-scan.gif')
        })
    })
})
