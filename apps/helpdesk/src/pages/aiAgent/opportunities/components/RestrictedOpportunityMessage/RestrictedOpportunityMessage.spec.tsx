import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { State } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type { OpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'

import { RestrictedOpportunityMessage } from './RestrictedOpportunityMessage'

const createMockPageState = (
    overrides: Partial<OpportunityPageState> = {},
): OpportunityPageState => ({
    state: State.RESTRICTED_NO_OPPORTUNITIES,
    isLoading: false,
    title: 'Upgrade to unlock more AI Agent opportunities',
    description:
        "You've reviewed 3 opportunities for AI Agent. To continue discovering and acting on new opportunities based on real customer conversations, upgrade your plan.",
    media: '/path/to/upgrade-image.jpg',
    primaryCta: {
        label: 'Try for 14 days',
    },
    showEmptyState: true,
    ...overrides,
})

describe('RestrictedOpportunityMessage', () => {
    it('should render the heading', () => {
        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState()}
            />,
        )

        expect(
            screen.getByRole('heading', {
                name: 'Upgrade to unlock more AI Agent opportunities',
            }),
        ).toBeInTheDocument()
    })

    it('should render the description text', () => {
        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState()}
            />,
        )

        expect(
            screen.getByText(/You've reviewed 3 opportunities for AI Agent/),
        ).toBeInTheDocument()
    })

    it('should render the media image when provided', () => {
        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState()}
            />,
        )

        const image = screen.getByRole('img', { name: 'Upgrade opportunities' })
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', '/path/to/upgrade-image.jpg')
    })

    it('should not render media image when not provided', () => {
        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState({ media: null })}
            />,
        )

        expect(
            screen.queryByRole('img', { name: 'Upgrade opportunities' }),
        ).not.toBeInTheDocument()
    })

    it('should render the Book a demo button', () => {
        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState()}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Book a demo' }),
        ).toBeInTheDocument()
    })

    it('should open demo URL when button is clicked', async () => {
        const user = userEvent.setup()
        const windowOpenSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        render(
            <RestrictedOpportunityMessage
                opportunitiesPageState={createMockPageState()}
            />,
        )

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Book a demo' })),
        )

        expect(windowOpenSpy).toHaveBeenCalledWith(
            'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_opportunities',
            '_blank',
        )

        windowOpenSpy.mockRestore()
    })
})
