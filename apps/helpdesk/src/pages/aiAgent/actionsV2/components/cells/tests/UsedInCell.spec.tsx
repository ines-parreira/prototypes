import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import GuidanceReferenceContext from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import UsedInCell from '../UsedInCell'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            skills: '/app/ai-agent/shopify/test/skills',
            knowledgeArticle: (type: string, id: number) =>
                `/app/ai-agent/shopify/test/knowledge/${type}/${id}`,
        },
    }),
}))

const mockPush = jest.fn()
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom')
    return {
        ...actual,
        useHistory: () => ({ push: mockPush }),
    }
})

const action = { id: 'action-1' } as StoreWorkflowsConfiguration

const renderWithReferences = (
    references: Array<{ id: number; title: string; sourceId: string }>,
) =>
    render(
        <GuidanceReferenceContext.Provider
            value={{
                canBeDeleted: () => true,
                references: { [action.id]: references },
            }}
        >
            <UsedInCell action={action} shopName="test" />
        </GuidanceReferenceContext.Provider>,
    )

describe('UsedInCell', () => {
    beforeEach(() => {
        mockPush.mockReset()
    })

    it('renders a Link button when there are no references', async () => {
        const user = userEvent.setup()
        renderWithReferences([])

        const button = screen.getByRole('button', { name: /link/i })
        await user.click(button)

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test/skills',
        )
    })

    it('renders the first reference and navigates to its guidance when clicked', async () => {
        const user = userEvent.setup()
        renderWithReferences([{ id: 1, title: 'Order status', sourceId: '42' }])

        const link = screen.getByRole('link', { name: /order status/i })
        await user.click(link)

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test/knowledge/guidance/42',
        )
    })

    it('truncates long titles to 15 chars with an ellipsis', () => {
        renderWithReferences([
            {
                id: 1,
                title: 'A very long guidance title that overflows',
                sourceId: '5',
            },
        ])

        expect(screen.getByText('A very long gui...')).toBeInTheDocument()
    })

    it('shows a +N button when there are extra references', async () => {
        const user = userEvent.setup()
        renderWithReferences([
            { id: 1, title: 'First', sourceId: '1' },
            { id: 2, title: 'Second', sourceId: '2' },
            { id: 3, title: 'Third', sourceId: '3' },
        ])

        const overflow = screen.getByRole('button', {
            name: /show 2 more references/i,
        })
        await user.click(overflow)

        const popoverLink = await screen.findByRole('link', { name: 'Second' })
        await user.click(popoverLink)

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test/knowledge/guidance/2',
        )
    })

    it('falls back to the skills page when sourceId is not numeric', async () => {
        const user = userEvent.setup()
        renderWithReferences([
            { id: 1, title: 'No id', sourceId: 'not-a-number' },
        ])

        await user.click(screen.getByRole('link', { name: /no id/i }))

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test/skills',
        )
    })
})
