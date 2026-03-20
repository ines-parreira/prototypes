import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { FlowsCard } from './FlowsCard'

jest.mock('./FlowsSettings', () => ({
    FlowsSettings: () => (
        <div data-testid="flows-settings">FlowsSettings Component</div>
    ),
}))

const mockChannel = {
    type: TicketChannel.Chat,
    value: {
        id: 1,
        name: 'Test Chat',
        meta: {
            app_id: 'test-app-id',
            shop_name: 'test-shop',
            shop_type: 'shopify',
        },
    },
} as SelfServiceChatChannel

const defaultProps = {
    isLoading: false,
    shopName: 'test-shop',
    shopType: 'shopify',
    channel: mockChannel,
    primaryLanguage: 'en-US',
    workflowEntrypoints: undefined,
    workflowConfigurations: [],
    automationSettingsWorkflows: [],
    onChange: jest.fn(),
}

const renderComponent = (
    props: Partial<Parameters<typeof FlowsCard>[0]> = {},
) => {
    return renderWithQueryClientProvider(
        <MemoryRouter>
            <FlowsCard {...defaultProps} {...props} />
        </MemoryRouter>,
    )
}

describe('FlowsCard', () => {
    it('should render the card with heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: /flows/i }),
        ).toBeInTheDocument()
    })

    it('should render FlowsSettings component', () => {
        renderComponent()

        expect(screen.getByTestId('flows-settings')).toBeInTheDocument()
    })

    it('should render skeleton when isLoading is true', () => {
        renderComponent({ isLoading: true })

        expect(
            screen.queryByRole('heading', { name: /flows/i }),
        ).not.toBeInTheDocument()
        expect(screen.queryByTestId('flows-settings')).not.toBeInTheDocument()
    })
})
