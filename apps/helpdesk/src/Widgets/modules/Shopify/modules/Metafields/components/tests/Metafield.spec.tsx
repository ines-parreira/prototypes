import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS, Map } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { mockListMetafieldDefinitionsHandler } from '@gorgias/helpdesk-mocks'

import {
    shopifyBoolean,
    shopifyCollectionReference,
    shopifyColor,
    shopifyDateMetafield,
    shopifyDateTimeMetafield,
    shopifyDimension,
    shopifyFileReference,
    shopifyJson,
    shopifyListCollectionReference,
    shopifyListColor,
    shopifyListDate,
    shopifyListDatetime,
    shopifyListDimension,
    shopifyListFileReference,
    shopifyListLink,
    shopifyListMetaobjectReference,
    shopifyListMixedReference,
    shopifyListNumberDecimal,
    shopifyListNumberInteger,
    shopifyListPageReference,
    shopifyListProductReference,
    shopifyListRating,
    shopifyListSingleLineTextField,
    shopifyListUrl,
    shopifyListVariantReference,
    shopifyListVolume,
    shopifyListWeight,
    shopifyMetaobjectReference,
    shopifyMixedReference,
    shopifyMoney,
    shopifyMultiTextLineFieldMetafield,
    shopifyNumberDecimal,
    shopifyNumberInteger,
    shopifyPageReference,
    shopifyProductReference,
    shopifyProductVariantReference,
    shopifyRating,
    shopifyRichTextField,
    shopifySingleTextLineFieldMetafield,
    shopifyUrl,
    shopifyUrlMetafield,
    shopifyVolume,
    shopifyWeight,
} from 'fixtures/shopify'
import type { IntegrationContextType } from 'providers/infobar/IntegrationContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import Metafield from '../Metafield'

const integrationContext: IntegrationContextType = {
    integration: Map<string, unknown>(
        fromJS({
            name: 'test-store',
        }),
    ),
    integrationId: 1,
}

const server = setupServer()

const mockListMetafieldDefinitions = mockListMetafieldDefinitionsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [],
        }),
)

describe('<MetafieldNew />', () => {
    const mockStore = configureMockStore()
    const store = mockStore({
        currentAccount: fromJS({ domain: 'domain' }),
    })
    let queryClient: QueryClient

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.resetAllMocks()
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
            logger: {
                log: jest.fn(),
                warn: console.warn,
                error: () => {},
            },
        })
        server.use(mockListMetafieldDefinitions.handler)
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <IntegrationContext.Provider value={integrationContext}>
                        {ui}
                    </IntegrationContext.Provider>
                </Provider>
            </QueryClientProvider>,
        )
    }

    describe('render()', () => {
        describe('text field metafields', () => {
            it.each([
                [
                    'single_line_text_field',
                    shopifySingleTextLineFieldMetafield(),
                    'testing single line with a lot of text testing single line with a lot of text',
                    1,
                ],
                [
                    'multi_line_text_field with less than 80 characters',
                    {
                        ...shopifyMultiTextLineFieldMetafield(),
                        value: 'testing metafield\\nwith less than 80 characters',
                    },
                    'testing metafield\\nwith less than 80 characters',
                    1,
                ],
                [
                    'multi_line_text_field truncated to 80 characters',
                    shopifyMultiTextLineFieldMetafield(),
                    'testing\\nmulti\\nline\\nwith\\na\\nlot\\nof\\ntext\\ntesting\\nmulti\\nline\\nwith\\na\\n...',
                    2,
                ],
            ])(
                'should render with %s',
                (_, metafield, expectedText, buttonCount) => {
                    renderWithProviders(<Metafield metafield={metafield} />)
                    expect(screen.getByText(expectedText))
                    expect(screen.getAllByRole('button').length).toBe(
                        buttonCount,
                    )
                },
            )
        })

        describe('text field modal interactions', () => {
            it('should render See more button and modal for long text fields', async () => {
                const longValue =
                    'This is a very long text that exceeds 120 characters. It should trigger the modal functionality with a "See more" button. When clicked, it should open a modal displaying the full content.'
                const metafieldWithModal = {
                    namespace: 'custom',
                    key: 'test_multi_line',
                    value: longValue,
                    type: 'multi_line_text_field',
                    owner_resource: 'product',
                } as any

                renderWithProviders(
                    <Metafield metafield={metafieldWithModal} />,
                )

                const seeMoreButton = screen.getByRole('button', {
                    name: /see more/i,
                })
                expect(seeMoreButton).toBeInTheDocument()

                await userEvent.click(seeMoreButton)

                const modalTitle = await screen.findByText(
                    /metafield: test_multi_line/i,
                )
                expect(modalTitle).toBeInTheDocument()

                const closeButton = screen.getByRole('button', {
                    name: /close/i,
                })
                expect(closeButton).toBeInTheDocument()

                await userEvent.click(closeButton)

                expect(
                    screen.queryByText(/metafield: test_multi_line/i),
                ).not.toBeInTheDocument()
            })
        })

        describe('simple value metafields', () => {
            it.each([
                [
                    'variant_reference',
                    shopifyProductVariantReference(),
                    'gid://shopify/ProductVariant/40416320323627',
                ],
                [
                    'file_reference',
                    shopifyFileReference(),
                    'gid://shopify/MediaImage/22300347564075',
                ],
                [
                    'metaobject_reference',
                    shopifyMetaobjectReference(),
                    'gid://shopify/Metaobject/79372845099',
                ],
                [
                    'mixed_reference',
                    shopifyMixedReference(),
                    'gid://shopify/Metaobject/79372845099',
                ],
                ['number_decimal', shopifyNumberDecimal(), '123.22'],
                ['number_integer', shopifyNumberInteger(), '123'],
            ])('should render with %s', (_, metafield, expectedText) => {
                renderWithProviders(<Metafield metafield={metafield} />)
                expect(screen.getByText(expectedText))
                expect(screen.getByRole('button'))
            })
        })

        describe('date metafields', () => {
            it('should render with date', () => {
                renderWithProviders(
                    <Metafield metafield={shopifyDateMetafield()} />,
                )
                expect(screen.getByText('Feb 6, 2024'))
                expect(screen.getByRole('button'))
            })
        })

        describe('date time metafields', () => {
            it('should render with date_time', () => {
                renderWithProviders(
                    <Metafield metafield={shopifyDateTimeMetafield()} />,
                )
                expect(screen.getByText('Feb 6, 2024'))
                expect(screen.getByText('01:30 PM'))
                expect(screen.getByRole('button'))
            })
        })

        describe('boolean metafields', () => {
            it.each([
                [true, 'true'],
                [false, 'false'],
            ])('should render with boolean value %s', (value, expectedText) => {
                renderWithProviders(
                    <Metafield metafield={shopifyBoolean(value)} />,
                )
                expect(screen.getByText(expectedText))
                expect(screen.getByRole('button'))
            })
        })

        describe('url metafields', () => {
            it.each([
                ['url with default value', shopifyUrlMetafield(), 'google.ro'],
                [
                    'url less than 20 characters',
                    shopifyUrl('https://gorgias.com'),
                    'gorgias.com',
                ],
                [
                    'url more than 20 characters',
                    shopifyUrl('https://gorgias.com/app/customer/101'),
                    'gorgias.com/app/cust...',
                ],
            ])('should render with %s', (_, metafield, expectedText) => {
                renderWithProviders(<Metafield metafield={metafield} />)
                expect(screen.getByText(expectedText))
                expect(screen.getByRole('button'))
            })
        })

        describe('reference metafields', () => {
            it.each([
                [
                    'product_reference',
                    shopifyProductReference(),
                    '471971234070',
                ],
                [
                    'collection_reference',
                    shopifyCollectionReference(),
                    '471971234070',
                ],
                ['page_reference', shopifyPageReference(), '471971234070'],
            ])('should render with %s', (_, metafield, expectedText) => {
                renderWithProviders(<Metafield metafield={metafield} />)
                expect(screen.getByText(expectedText))
                expect(screen.getByRole('button'))
            })
        })

        describe('color metafields', () => {
            it('should render with color', () => {
                renderWithProviders(<Metafield metafield={shopifyColor()} />)
                expect(screen.getByText('#2b78b6'))
                expect(screen.getByRole('button'))
            })
        })

        describe('json metafields', () => {
            it('should render with json', () => {
                renderWithProviders(<Metafield metafield={shopifyJson()} />)
                expect(screen.getByText(/foo/))
                expect(screen.getByText(/bar/))
                expect(screen.getByRole('button'))
            })
        })

        describe('rich text field metafields', () => {
            it('should render with rich_text_field', () => {
                renderWithProviders(
                    <Metafield metafield={shopifyRichTextField()} />,
                )
                expect(
                    screen.getByText(
                        'adsa adasda asdasda b c d e f g h i j k l m sadasda',
                    ),
                )
                expect(screen.getByRole('button'))
            })
        })

        describe('dimension metafields', () => {
            it.each([
                ['dimension', shopifyDimension(), '123 cm'],
                ['weight', shopifyWeight(), '123 oz'],
                ['volume', shopifyVolume(), '123 fl oz'],
            ])('should render with %s', (_, metafield, expectedText) => {
                renderWithProviders(<Metafield metafield={metafield} />)
                expect(screen.getByText(expectedText))
                expect(screen.getByRole('button'))
            })
        })

        describe('rating metafields', () => {
            it('should render with rating', () => {
                renderWithProviders(<Metafield metafield={shopifyRating()} />)
                expect(screen.getByText('4.5 out of 5.0'))
                expect(screen.getByRole('button'))
            })
        })

        describe('money metafields', () => {
            it('should render with money', () => {
                renderWithProviders(<Metafield metafield={shopifyMoney()} />)
                expect(screen.getByText('$123.00'))
                expect(screen.getByRole('button'))
            })
        })

        describe('list simple value metafields', () => {
            it.each([
                [
                    'list.single_line_text_field',
                    shopifyListSingleLineTextField(),
                    ['test1', 'test2'],
                    2,
                ],
                [
                    'list.variant_reference',
                    shopifyListVariantReference(),
                    ['test1', 'test2'],
                    2,
                ],
                [
                    'list.file_reference',
                    shopifyListFileReference(),
                    ['test1', 'test2'],
                    2,
                ],
                [
                    'list.metaobject_reference',
                    shopifyListMetaobjectReference(),
                    ['test1', 'test2'],
                    2,
                ],
                [
                    'list.mixed_reference',
                    shopifyListMixedReference(),
                    ['test1', 'test2'],
                    2,
                ],
                [
                    'list.number_decimal',
                    shopifyListNumberDecimal(),
                    ['3.23', '222.54'],
                    2,
                ],
                [
                    'list.number_integer',
                    shopifyListNumberInteger(),
                    ['3424', '534'],
                    2,
                ],
            ])(
                'should render with %s',
                (_, metafield, expectedTexts, buttonCount) => {
                    renderWithProviders(<Metafield metafield={metafield} />)
                    expectedTexts.forEach((text) => {
                        expect(screen.getByText(text))
                    })
                    expect(screen.getAllByRole('button').length).toBe(
                        buttonCount,
                    )
                },
            )
        })

        describe('list date metafields', () => {
            it('should render with list.date', () => {
                renderWithProviders(<Metafield metafield={shopifyListDate()} />)
                expect(screen.getByText('Feb 2, 2024'))
                expect(screen.getByText('May 2, 2024'))
                expect(screen.getAllByRole('button').length).toBe(2)
            })
        })

        describe('list datetime metafields', () => {
            it('should render with list.date_time', () => {
                renderWithProviders(
                    <Metafield metafield={shopifyListDatetime()} />,
                )
                expect(screen.getByText('Feb 2, 2024'))
                expect(screen.getByText('12:24 PM'))
                expect(screen.getByText('May 2, 2024'))
                expect(screen.getByText('03:18 PM'))
                expect(screen.getAllByRole('button').length).toBe(2)
            })
        })

        describe('list reference metafields', () => {
            it.each([
                [
                    'list.product_reference',
                    shopifyListProductReference(),
                    ['40416320523627', '40416320323627'],
                ],
                [
                    'list.collection_reference',
                    shopifyListCollectionReference(),
                    ['40416320523627', '40416320323627'],
                ],
                [
                    'list.page_reference',
                    shopifyListPageReference(),
                    ['40416320523627', '40416320323627'],
                ],
            ])('should render with %s', (_, metafield, expectedTexts) => {
                renderWithProviders(<Metafield metafield={metafield} />)
                expectedTexts.forEach((text) => {
                    expect(screen.getByText(text))
                })
                expect(screen.getAllByRole('button').length).toBe(2)
            })
        })

        describe('list url metafields', () => {
            it('should render with list.url', () => {
                renderWithProviders(<Metafield metafield={shopifyListUrl()} />)
                expect(screen.getByText('gorgias.com/about'))
                expect(screen.getByText('admin.shopify.com/st...'))
                expect(screen.getAllByRole('button').length).toBe(2)
            })
        })

        describe('list link metafields', () => {
            it('should render with list.link', () => {
                renderWithProviders(
                    <Metafield metafield={shopifyListLink() as any} />,
                )
                expect(
                    screen.getByRole('link', { name: 'Gorgias' }),
                ).toHaveAttribute('href', 'https://gorgias.com')
                expect(
                    screen.getByRole('link', { name: 'Shopify' }),
                ).toHaveAttribute('href', 'https://shopify.com')
                expect(screen.getAllByRole('button').length).toBe(2)
            })
        })

        describe('list color metafields', () => {
            it('should render with list.color', () => {
                renderWithProviders(
                    <Metafield metafield={shopifyListColor()} />,
                )
                expect(screen.getByText('#85bc62'))
                expect(screen.getByText('#2189bd'))
                expect(screen.getAllByRole('button').length).toBe(2)
            })
        })

        describe('list dimension metafields', () => {
            it.each([
                ['list.weight', shopifyListWeight(), ['12 kg', '11 g']],
                ['list.volume', shopifyListVolume(), ['12 L', '11 m³']],
                ['list.dimension', shopifyListDimension(), ['12 m', '11 cm']],
            ])('should render with %s', (_, metafield, expectedTexts) => {
                renderWithProviders(<Metafield metafield={metafield} />)
                expectedTexts.forEach((text) => {
                    expect(screen.getByText(text))
                })
                expect(screen.getAllByRole('button').length).toBe(2)
            })
        })

        describe('list rating metafields', () => {
            it('should render with list.rating', () => {
                renderWithProviders(
                    <Metafield metafield={shopifyListRating()} />,
                )
                expect(screen.getByText('3.2 out of 5.0'))
                expect(screen.getByText('4.2 out of 5.0'))
                expect(screen.getAllByRole('button').length).toBe(2)
            })
        })

        describe('unknown metafield types', () => {
            it('should render nothing for unknown type', () => {
                renderWithProviders(
                    <Metafield
                        metafield={
                            {
                                namespace: 'custom',
                                key: 'test_unknown',
                                value: 'test',
                                type: 'unknown_type',
                            } as any
                        }
                    />,
                )
                expect(screen.queryByText('test')).not.toBeInTheDocument()
                expect(screen.queryByRole('button')).not.toBeInTheDocument()
            })
        })

        describe('label rendering', () => {
            it.each([
                [
                    'uses name when provided',
                    {
                        namespace: 'custom',
                        key: 'test_key',
                        value: 'test',
                        type: 'single_line_text_field',
                        name: 'Custom Name',
                    },
                    /Custom Name/,
                ],
                [
                    'falls back to startCase(key) when name is undefined',
                    {
                        namespace: 'custom',
                        key: 'test_key',
                        value: 'test',
                        type: 'single_line_text_field',
                    },
                    /Test Key/,
                ],
                [
                    'handles empty key when name is undefined',
                    {
                        namespace: 'custom',
                        key: '',
                        value: 'test',
                        type: 'single_line_text_field',
                    },
                    null,
                ],
            ])(
                'should render label that %s',
                (_, metafield, expectedLabelRegex) => {
                    renderWithProviders(
                        <Metafield metafield={metafield as any} />,
                    )
                    if (expectedLabelRegex) {
                        expect(
                            screen.getByText(expectedLabelRegex),
                        ).toBeInTheDocument()
                    }
                },
            )
        })
    })
})
