import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { Integration, IntegrationType } from 'models/integration/types'
import { StoreState } from 'state/types'

import {
    CssClasses,
    useStoreWithChatConnectionsOptions,
} from '../useStoreWithChatConnectionsOptions'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockAppSelector = jest.mocked(useAppSelector)

describe('useStoreWithChatConnectionsOptions', () => {
    const mockCssClasses: CssClasses = {
        option: 'option-class',
        icon: 'icon-class',
        connectedChatsCount: 'connected-chats-class',
    }

    const mockIntegrations = [
        {
            id: 1,
            name: 'Shop1',
            type: IntegrationType.Shopify,
            meta: { shop_name: 'Shop1' },
        },
        {
            id: 2,
            name: 'Shop2',
            type: IntegrationType.BigCommerce,
            meta: { store_hash: 'Shop2' },
        },
        {
            id: 1,
            name: 'Chat1',
            type: IntegrationType.GorgiasChat,
            meta: { shop_name: 'Shop1' },
        },
        {
            id: 2,
            name: 'Chat2',
            type: IntegrationType.GorgiasChat,
            meta: { shop_name: 'Shop1' },
        },
        {
            id: 3,
            name: 'Chat3',
            type: IntegrationType.GorgiasChat,
            meta: { shop_name: 'Shop2' },
        },
    ] as unknown as Integration[]

    beforeEach(() => {
        jest.resetAllMocks()
        mockAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({ integrations: mockIntegrations }),
            } as unknown as StoreState),
        )
    })

    it('should return the correct options with connected chats count', () => {
        const { result } = renderHook(() =>
            useStoreWithChatConnectionsOptions(mockCssClasses),
        )

        expect(result.current).toMatchInlineSnapshot(`
            [
              {
                "label": <span
                  className="option-class"
                >
                  <span>
                    <img
                      alt="integration logo"
                      className="icon-class"
                      src="/assets/img/integrations/shopify.png"
                    />
                  </span>
                  <span>
                    Shop1
                  </span>
                  <span
                    className="connected-chats-class"
                  >
                    2 connected chats
                  </span>
                </span>,
                "text": "Shop1",
                "value": "Shop1",
              },
              {
                "label": <span
                  className="option-class"
                >
                  <span>
                    <img
                      alt="integration logo"
                      className="icon-class"
                      src="/assets/img/integrations/bigcommerce.svg"
                    />
                  </span>
                  <span>
                    Shop2
                  </span>
                  <span
                    className="connected-chats-class"
                  >
                    1 connected chat
                  </span>
                </span>,
                "text": "Shop2",
                "value": "Shop2",
              },
            ]
        `)
    })

    it('should return options with no connected chats if there are no matching chat integrations', () => {
        mockAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: mockIntegrations.slice(0, 2),
                }),
            } as unknown as StoreState),
        )

        const { result } = renderHook(() =>
            useStoreWithChatConnectionsOptions(mockCssClasses),
        )

        expect(result.current).toMatchInlineSnapshot(`
            [
              {
                "label": <span
                  className="option-class"
                >
                  <span>
                    <img
                      alt="integration logo"
                      className="icon-class"
                      src="/assets/img/integrations/shopify.png"
                    />
                  </span>
                  <span>
                    Shop1
                  </span>
                </span>,
                "text": "Shop1",
                "value": "Shop1",
              },
              {
                "label": <span
                  className="option-class"
                >
                  <span>
                    <img
                      alt="integration logo"
                      className="icon-class"
                      src="/assets/img/integrations/bigcommerce.svg"
                    />
                  </span>
                  <span>
                    Shop2
                  </span>
                </span>,
                "text": "Shop2",
                "value": "Shop2",
              },
            ]
        `)
    })
})
