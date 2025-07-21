import React from 'react'

import { render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import '@testing-library/jest-dom/extend-expect'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AttachmentEnum } from 'common/types'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { RootState, StoreDispatch } from 'state/types'

import AiAgentChatConversation, {
    ConversationMessage,
} from '../AiAgentChatConversation'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
} as RootState

describe('AiAgentChatConversation', () => {
    const messages: ConversationMessage[] = [
        {
            content:
                'Hi, I’m after a long dress for everyday wear, something comfortable and cute.',
            isHtml: false,
            fromAgent: false,
            attachments: [],
        },
        {
            content: 'Hi! Our sizes are made for all shapes and body types.',
            isHtml: true,
            fromAgent: true,
            attachments: [
                {
                    content_type: AttachmentEnum.Product,
                    name: 'ADIDAS | SUPERSTAR 80S',
                    size: 0,
                    url: 'https://test.com/products/test-product1',
                    extra: {
                        price: '120.5',
                        variant_name: 'ADIDAS | SUPERSTAR 80S',
                        product_link: 'https://test.com/products/test-product1',
                        currency: 'USD',
                        featured_image:
                            'https://cdn.mos.cms.futurecdn.net/gPvyaz76tASn87RCGuSdDc.jpg',
                        product_id: 1,
                        variant_id: 2,
                    },
                },
            ],
        },
        {
            content:
                'Checkout this product <a href="https://example.com/moisturizer" target="_blank">View Product</a>.',
            isHtml: true,
            fromAgent: true,
            attachments: [],
        },
        {
            content: 'Nice!',
            isHtml: false,
            fromAgent: false,
            attachments: [],
        },
        {
            content: 'Bye!',
            isHtml: false,
            fromAgent: false,
            attachments: [],
        },
    ]

    const user = Map({ name: 'Test User' })

    it('renders agent and customer messages correctly when removeLinksFromMessages is false', () => {
        const { getByText, getByRole } = render(
            <Provider store={mockStore(defaultState)}>
                <AiAgentChatConversation
                    conversationColor="#000"
                    messages={messages}
                    user={user}
                    removeLinksFromMessages={false}
                />
            </Provider>,
        )
        expect(
            getByText(
                'Hi, I’m after a long dress for everyday wear, something comfortable and cute.',
            ),
        ).toBeInTheDocument()
        expect(
            getByText('Hi! Our sizes are made for all shapes and body types.'),
        ).toBeInTheDocument()
        expect(getByText('ADIDAS | SUPERSTAR 80S')).toBeInTheDocument()
        expect(getByText('Nice!')).toBeInTheDocument()
        expect(getByText(/View Product/)).toBeInTheDocument()
        expect(getByRole('link')).toBeInTheDocument()
    })

    it('renders agent and customer messages correctly when removeLinksFromMessages is true', () => {
        const { getByText, queryByRole } = render(
            <Provider store={mockStore(defaultState)}>
                <AiAgentChatConversation
                    conversationColor="#000"
                    messages={messages}
                    user={user}
                    removeLinksFromMessages
                />
            </Provider>,
        )
        expect(
            getByText(
                'Hi, I’m after a long dress for everyday wear, something comfortable and cute.',
            ),
        ).toBeInTheDocument()
        expect(
            getByText('Hi! Our sizes are made for all shapes and body types.'),
        ).toBeInTheDocument()
        expect(getByText('ADIDAS | SUPERSTAR 80S')).toBeInTheDocument()
        expect(getByText('Nice!')).toBeInTheDocument()
        expect(getByText(/View Product/)).toBeInTheDocument()
        expect(queryByRole('link')).not.toBeInTheDocument()
    })
})
