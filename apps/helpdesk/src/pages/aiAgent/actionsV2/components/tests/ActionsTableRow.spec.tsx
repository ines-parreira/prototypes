import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import GuidanceReferenceContext from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import ActionsTableRow from '../ActionsTableRow'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            editAction: (id: string) =>
                `/app/ai-agent/shopify/test/actions/edit/${id}`,
            appDetail: (id: string) =>
                `/app/settings/integrations/app/${id}/actions`,
            actionEvents: (id: string) =>
                `/app/ai-agent/shopify/test/actions/events/${id}`,
            skills: '/app/ai-agent/shopify/test/skills',
            knowledgeArticle: (type: string, id: number) =>
                `/app/ai-agent/shopify/test/knowledge/${type}/${id}`,
        },
    }),
}))

const mockPush = jest.fn()
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom')
    return { ...actual, useHistory: () => ({ push: mockPush }) }
})

jest.mock('models/workflows/queries', () => ({
    useListActionsApps: () => ({ data: [] }),
    useGetWorkflowConfigurationTemplates: () => ({ data: [] }),
}))
jest.mock('pages/automate/actionsPlatform/hooks/useApps', () => ({
    __esModule: true,
    default: () => ({ apps: [] }),
}))
jest.mock(
    'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp',
    () => ({
        __esModule: true,
        default: () => () => undefined,
    }),
)
jest.mock('pages/aiAgent/actions/hooks/useDeleteAction', () => ({
    __esModule: true,
    default: () => ({ mutate: jest.fn(), isLoading: false }),
}))

const action = {
    id: 'action-1',
    internal_id: 'internal-1',
    name: 'Cancel order',
    apps: [],
    steps: [],
    entrypoints: [
        {
            kind: 'llm-conversation',
            trigger: 'llm-prompt',
            settings: {
                instructions: '',
                requires_confirmation: false,
                is_standalone: true,
            },
            deactivated_datetime: null,
        },
    ],
} as unknown as StoreWorkflowsConfiguration

const renderRow = () =>
    render(
        <GuidanceReferenceContext.Provider
            value={{ canBeDeleted: () => true, references: {} }}
        >
            <table>
                <tbody>
                    <ActionsTableRow
                        action={action}
                        shopName="test"
                        shopType="shopify"
                        serviceConnectionStatuses={{
                            byAppId: {},
                            isError: false,
                            isLoading: false,
                        }}
                    />
                </tbody>
            </table>
        </GuidanceReferenceContext.Provider>,
    )

describe('ActionsTableRow', () => {
    beforeEach(() => {
        mockPush.mockReset()
    })

    it('exposes the row as a link with the action name', () => {
        renderRow()

        expect(
            screen.getByRole('link', { name: /open action cancel order/i }),
        ).toBeInTheDocument()
    })

    it('navigates to the action detail when the row is clicked', async () => {
        const user = userEvent.setup()
        renderRow()

        await user.click(
            screen.getByRole('link', { name: /open action cancel order/i }),
        )

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test/actions/edit/action-1',
        )
    })

    it('navigates on Enter key as well', async () => {
        const user = userEvent.setup()
        renderRow()

        const row = screen.getByRole('link', {
            name: /open action cancel order/i,
        })
        row.focus()
        await user.keyboard('{Enter}')

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test/actions/edit/action-1',
        )
    })
})
