// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import React, { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { account } from 'fixtures/account'
import { AI_AGENT } from 'pages/aiAgent/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

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

jest.mock('core/flags')

const defaultStore = mockStore({
    currentAccount: fromJS({
        ...account,
    }),
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
})

const queryClient = mockQueryClient()

const renderComponent = (
    props: Partial<ComponentProps<typeof AiAgentLayout>>,
) => {
    renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={defaultStore}>
                <AiAgentLayout shopName="test-shop" title={AI_AGENT} {...props}>
                    Test Content
                </AiAgentLayout>
            </Provider>
        </QueryClientProvider>,
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
