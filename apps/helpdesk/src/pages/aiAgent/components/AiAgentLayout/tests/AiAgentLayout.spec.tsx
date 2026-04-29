import { render } from '@repo/testing'

// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import type { ComponentProps } from 'react'

import { screen } from '@testing-library/react'

import { AI_AGENT } from 'pages/aiAgent/constants'

import { AiAgentLayout } from '../AiAgentLayout'

jest.mock('../../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: () => ({
        storeConfiguration: undefined,
        isLoading: false,
        updateStoreConfiguration: jest.fn(),
        isPendingCreateOrUpdate: false,
    }),
}))
jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: () => ({
        aiAgentTicketViewId: 1,
    }),
}))
jest.mock('../../../hooks/useAiAgentEnabled', () => ({
    useAiAgentEnabled: () => ({
        updateSettingsAfterAiAgentEnabled: jest.fn(),
    }),
}))
jest.mock('@repo/feature-flags')
const renderComponent = (
    props: Partial<ComponentProps<typeof AiAgentLayout>>,
) => {
    render(
        <AiAgentLayout shopName="test-shop" title={AI_AGENT} {...props}>
            Test Content
        </AiAgentLayout>,
        {
            path: '/app/ai-agent/:shopType/:shopName/settings',
            initialEntries: ['/app/ai-agent/shopify/test-shop/settings'],
        },
    )
}
describe('<AiAgentLayout />', () => {
    it('should render', () => {
        renderComponent({})
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
    it('should hide the title when fullscreen = true', () => {
        renderComponent({ fullscreen: true })
        const title = screen.queryByText(AI_AGENT)
        expect(title).not.toBeInTheDocument()
    })
    it('should render the title when fullscreen = false', () => {
        renderComponent({ fullscreen: false })
        const title = screen.getByText(AI_AGENT)
        expect(title).toBeInTheDocument()
    })
})
