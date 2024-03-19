import {render, screen} from '@testing-library/react'
import React from 'react'

import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {
    shopifyDateMetafield,
    shopifyDateTimeMetafield,
    shopifyFileReference,
    shopifyMetaobjectReference,
    shopifyMixedReference,
    shopifyMultiTextLineFieldMetafield,
    shopifyProductVariantReference,
    shopifySingleTextLineFieldMetafield,
    shopifyUrlMetafield,
} from 'fixtures/shopify'
import MetaField from '../MetaField'

describe('<MetaField/>', () => {
    const mockStore = configureMockStore()
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const store = mockStore({
        currentAccount: fromJS({domain: 'domain'}),
    })

    describe('render()', () => {
        it('should render with shopifyUrlMetafield', () => {
            render(
                <Provider store={store}>
                    <MetaField metafield={shopifyUrlMetafield()} />
                </Provider>
            )
            expect(screen.getByText(`https://google.ro`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifySingleLineTextFieldMetafield', () => {
            render(
                <Provider store={store}>
                    <MetaField
                        metafield={shopifySingleTextLineFieldMetafield()}
                    />
                </Provider>
            )
            expect(
                screen.getByText(
                    `testing single line with a lot of text testing single line with a lot of text`
                )
            )
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyMultiLineTextFieldMetafield', () => {
            render(
                <Provider store={store}>
                    <MetaField
                        metafield={shopifyMultiTextLineFieldMetafield()}
                    />
                </Provider>
            )
            expect(
                screen.getByText(
                    `testing\\nmulti\\nline\\nwith\\na\\nlot\\nof\\ntext\\ntesting\\nmulti\\nline\\nwith\\na\\nlot\\nof\\ntext\\ntesting\\nmulti\\nline\\nwith\\na\\nlot\\nof\\ntext\\n\\n`
                )
            )
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyDateMetafield', () => {
            render(
                <Provider store={store}>
                    <MetaField metafield={shopifyDateMetafield()} />
                </Provider>
            )
            expect(screen.getByText(`02/06/2024`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyDateTimeMetafield', () => {
            render(
                <Provider store={store}>
                    <MetaField metafield={shopifyDateTimeMetafield()} />
                </Provider>
            )
            expect(screen.getByText(`02/06/2024`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyProductVariantReference', () => {
            render(
                <Provider store={store}>
                    <MetaField metafield={shopifyProductVariantReference()} />
                </Provider>
            )
            expect(
                screen.getByText(`gid://shopify/ProductVariant/40416320323627`)
            )
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyFileReference', () => {
            render(
                <Provider store={store}>
                    <MetaField metafield={shopifyFileReference()} />
                </Provider>
            )
            expect(screen.getByText(`gid://shopify/MediaImage/22300347564075`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyMetaobjectReference', () => {
            render(
                <Provider store={store}>
                    <MetaField metafield={shopifyMetaobjectReference()} />
                </Provider>
            )
            expect(screen.getByText(`gid://shopify/Metaobject/79372845099`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyMixedReference', () => {
            render(
                <Provider store={store}>
                    <MetaField metafield={shopifyMixedReference()} />
                </Provider>
            )
            expect(screen.getByText(`gid://shopify/Metaobject/79372845099`))
            expect(screen.getByRole('button'))
        })
    })
})
