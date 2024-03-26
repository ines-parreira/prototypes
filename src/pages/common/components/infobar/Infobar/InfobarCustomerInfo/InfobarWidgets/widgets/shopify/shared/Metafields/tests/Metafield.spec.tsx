import {render, screen} from '@testing-library/react'
import React from 'react'

import configureMockStore from 'redux-mock-store'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'
import {
    shopifyBoolean,
    shopifyCollectionReference,
    shopifyColor,
    shopifyDateMetafield,
    shopifyDateTimeMetafield,
    shopifyFileReference,
    shopifyJson,
    shopifyMetaobjectReference,
    shopifyMixedReference,
    shopifyMultiTextLineFieldMetafield,
    shopifyPageReference,
    shopifyProductReference,
    shopifyNumberDecimal,
    shopifyNumberInteger,
    shopifyProductVariantReference,
    shopifyRichTextField,
    shopifySingleTextLineFieldMetafield,
    shopifyUrl,
    shopifyUrlMetafield,
    shopifyDimension,
    shopifyWeight,
    shopifyVolume,
    shopifyRating,
} from 'fixtures/shopify'
import {
    IntegrationContext,
    IntegrationContextType,
} from 'providers/infobar/IntegrationContext'
import Metafield from '../Metafield'

const integrationContext: IntegrationContextType = {
    integration: Map<string, unknown>(
        fromJS({
            name: 'test-store',
        })
    ),
    integrationId: 1,
}

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
                    <Metafield metafield={shopifyUrlMetafield()} />
                </Provider>
            )
            expect(screen.getByText(`google.ro`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifySingleLineTextFieldMetafield', () => {
            render(
                <Provider store={store}>
                    <Metafield
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

        it('should render with shopifyMultiLineTextFieldMetafield truncated to 80 characters', () => {
            render(
                <Provider store={store}>
                    <Metafield
                        metafield={shopifyMultiTextLineFieldMetafield()}
                    />
                </Provider>
            )
            expect(
                screen.getByText(
                    `testing\\nmulti\\nline\\nwith\\na\\nlot\\nof\\ntext\\ntesting\\nmulti\\nline\\nwith\\na\\n...`
                )
            )
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyMultiLineTextFieldMetafield', () => {
            const metafield = shopifyMultiTextLineFieldMetafield()
            metafield.value = 'testing metafield\\nwith less than 80 characters'
            render(
                <Provider store={store}>
                    <Metafield metafield={metafield} />
                </Provider>
            )
            expect(
                screen.getByText(
                    `testing metafield\\nwith less than 80 characters`
                )
            )
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyDateMetafield', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyDateMetafield()} />
                </Provider>
            )
            expect(screen.getByText(`Feb 6, 2024`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyDateTimeMetafield', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyDateTimeMetafield()} />
                </Provider>
            )
            expect(screen.getByText(`Feb 6, 2024`))
            expect(screen.getByText(`01:30 PM`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyProductVariantReference', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyProductVariantReference()} />
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
                    <Metafield metafield={shopifyFileReference()} />
                </Provider>
            )
            expect(screen.getByText(`gid://shopify/MediaImage/22300347564075`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyMetaobjectReference', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyMetaobjectReference()} />
                </Provider>
            )
            expect(screen.getByText(`gid://shopify/Metaobject/79372845099`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyMixedReference', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyMixedReference()} />
                </Provider>
            )
            expect(screen.getByText(`gid://shopify/Metaobject/79372845099`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyBoolean', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyBoolean()} />
                </Provider>
            )
            expect(screen.getByText(`true`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyColor', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyColor()} />
                </Provider>
            )
            expect(screen.getByText(`#2b78b6`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyNumberDecimal', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyNumberDecimal()} />
                </Provider>
            )
            expect(screen.getByText(`123.22`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyNumberInteger', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyNumberInteger()} />
                </Provider>
            )
            expect(screen.getByText(`123`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyJson', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyJson()} />
                </Provider>
            )
            expect(screen.queryByText(`foo`))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyUrl less than 20 characters', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyUrl('https://gorgias.com')} />
                </Provider>
            )
            expect(screen.getByText('gorgias.com'))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyUrl more than 20 characters', () => {
            render(
                <Provider store={store}>
                    <Metafield
                        metafield={shopifyUrl(
                            'https://gorgias.com/app/customer/101'
                        )}
                    />
                </Provider>
            )
            expect(screen.getByText('gorgias.com/app/cust...'))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyProductReference', () => {
            render(
                <Provider store={store}>
                    <IntegrationContext.Provider value={integrationContext}>
                        <Metafield metafield={shopifyProductReference()} />
                    </IntegrationContext.Provider>
                </Provider>
            )
            expect(screen.getByText('471971234070'))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyCollectionReference', () => {
            render(
                <Provider store={store}>
                    <IntegrationContext.Provider value={integrationContext}>
                        <Metafield metafield={shopifyCollectionReference()} />
                    </IntegrationContext.Provider>
                </Provider>
            )
            expect(screen.getByText('471971234070'))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyPageReference', () => {
            render(
                <Provider store={store}>
                    <IntegrationContext.Provider value={integrationContext}>
                        <Metafield metafield={shopifyPageReference()} />
                    </IntegrationContext.Provider>
                </Provider>
            )
            expect(screen.getByText('471971234070'))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyRichTextField', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyRichTextField()} />
                </Provider>
            )
            expect(
                screen.queryByText(
                    'adsa adasda asdasda b c d e f g h i j k l m  sadasda'
                )
            )
            expect(screen.getByRole('button'))
        })

        it('should render empty with shopifyRichTextField', () => {
            const metafield = shopifyRichTextField()
            metafield.value = {}
            render(
                <Provider store={store}>
                    <Metafield metafield={metafield} />
                </Provider>
            )
            expect(screen.queryByText('test_rich_text_field'))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyDimension', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyDimension()} />
                </Provider>
            )
            expect(screen.getByText('123 cm'))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyWeight', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyWeight()} />
                </Provider>
            )
            expect(screen.getByText('123 oz'))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyVolume', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyVolume()} />
                </Provider>
            )
            expect(screen.getByText('123 us fl oz'))
            expect(screen.getByRole('button'))
        })

        it('should render with shopifyRating', () => {
            render(
                <Provider store={store}>
                    <Metafield metafield={shopifyRating()} />
                </Provider>
            )
            expect(screen.getByText('4.5 out of 5.0'))
            expect(screen.getByRole('button'))
        })
    })
})
