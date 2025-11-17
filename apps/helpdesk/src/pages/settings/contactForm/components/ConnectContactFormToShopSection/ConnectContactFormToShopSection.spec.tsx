import type React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import type { RootState, StoreDispatch } from 'state/types'

import { useShopifyStoreWithChatConnectionsOptions } from '../../../helpCenter/hooks/useShopifyStoreWithChatConnectionsOptions'
import { ConnectContactFormToShopSection } from './ConnectContactFormToShopSection'

jest.mock(
    'pages/settings/helpCenter/hooks/useShopifyStoreWithChatConnectionsOptions',
)

const mockedUseShopifyStoreWithChatConnectionsOptions = jest.mocked(
    useShopifyStoreWithChatConnectionsOptions,
)
const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const renderComponent = (
    props: Partial<
        React.ComponentProps<typeof ConnectContactFormToShopSection>
    >,
) => {
    return render(
        <Provider store={mockStore(defaultState)}>
            <ConnectContactFormToShopSection
                shopName={null}
                shopIntegrationId={null}
                onUpdate={() => {
                    return
                }}
                {...props}
            />
        </Provider>,
    )
}

describe('<ConnectContactFormToShopSection />', () => {
    beforeEach(() => {
        mockedUseShopifyStoreWithChatConnectionsOptions.mockReset()
    })

    it('should render component', () => {
        renderComponent({})

        expect(screen.getByText('Connect a store')).toBeInTheDocument()
    })

    it('should disable form when shop name exist', () => {
        const { container } = renderComponent({
            shopName: 'gorgiastest.mybigcommerce.com',
        })

        const button = container.querySelector('#store-select')
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent('gorgiastest.mybigcommerce.com')
        expect(button).toHaveClass('disabled')
    })

    it('should update the shop name if selected', () => {
        const fakeOnUpdate = jest.fn()

        const { container } = renderComponent({
            shopName: null,
            onUpdate: fakeOnUpdate,
        })

        userEvent.click(screen.getByText('Connect a store'))

        userEvent.click(screen.getByText('gorgiastest.mybigcommerce.com'))

        const button = container.querySelector('#store-select')
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent('gorgiastest.mybigcommerce.com')
        expect(fakeOnUpdate).toHaveBeenCalledWith({
            shop_name: 'gorgiastest.mybigcommerce.com',
            shop_integration_id: 515,
        })
    })
})
