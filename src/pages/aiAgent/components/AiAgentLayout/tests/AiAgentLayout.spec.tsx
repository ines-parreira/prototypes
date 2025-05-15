// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import React, { ComponentProps } from 'react'

import { screen } from '@testing-library/react'

import { AI_AGENT } from 'pages/aiAgent/constants'
import history from 'pages/history'
import { renderWithRouter } from 'utils/testing'

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

const renderComponent = (
    props: Partial<ComponentProps<typeof AiAgentLayout>>,
) => {
    renderWithRouter(
        <AiAgentLayout shopName="test-shop" title={AI_AGENT} {...props}>
            Test Content
        </AiAgentLayout>,
        {
            route: '/app/ai-agent/shopify/test-shop/settings',
            path: '/app/ai-agent/:shopType/:shopName/settings',
        },
    )
}
describe('<AiAgentLayout />', () => {
    it('should render', () => {
        renderComponent({})
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render ai agent ticket view button and redirect to ticket view on click', () => {
        renderComponent({})
        const ticketViewButton = screen.getByRole('button', {
            name: 'View AI Agent Tickets',
        })
        ticketViewButton.click()
        expect(history.push).toHaveBeenCalledWith('/app/views/1', {
            skipRedirect: true,
        })
    })

    it('should hide ai agent ticket view button if hideAiAgentTicketsViewButton props is passed', () => {
        renderComponent({ hideViewAiAgentTicketsButton: true })
        const ticketViewButton = screen.queryByRole('button', {
            name: 'View AI Agent Tickets',
        })
        expect(ticketViewButton).not.toBeInTheDocument()
    })

    it('should hide the title and the navigation when fullscreen = true', () => {
        renderComponent({ fullscreen: true })

        const title = screen.queryByText(AI_AGENT)
        const navigation = screen.queryByRole('navigation')
        expect(title).not.toBeInTheDocument()
        expect(navigation).not.toBeInTheDocument()
    })

    it('should render the title and the navigation when fullscreen = false', () => {
        renderComponent({ fullscreen: false })

        const title = screen.getByText(AI_AGENT)
        const navigation = screen.getByRole('navigation')
        expect(title).toBeInTheDocument()
        expect(navigation).toBeInTheDocument()
    })
})
