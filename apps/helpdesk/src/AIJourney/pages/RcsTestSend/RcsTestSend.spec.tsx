import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams } from 'react-router-dom'

import { useAiJourneyPhoneList } from 'AIJourney/hooks/useAiJourneyPhoneList/useAiJourneyPhoneList'
import { useJourneyContext } from 'AIJourney/providers'
import type { RcsTestSendResponse } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'
import { useRcsTestSend } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'
import type { PhoneOption } from 'AIJourney/types/RcsTestSend'
import type { Product } from 'constants/integrations/types/shopify'

import { RcsTestSend } from './RcsTestSend'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

jest.mock(
    'AIJourney/hooks/useAiJourneyPhoneList/useAiJourneyPhoneList',
    () => ({
        useAiJourneyPhoneList: jest.fn(),
    }),
)

jest.mock('AIJourney/queries/useRcsTestSend/useRcsTestSend', () => ({
    useRcsTestSend: jest.fn(),
}))

jest.mock('AIJourney/components/RcsRequestCard/RcsRequestCard', () => ({
    RcsRequestCard: ({
        onOptionChange,
        onPhoneChange,
        onDryRunChange,
        phoneInput,
        dryRun,
        phoneOptions,
    }: {
        onOptionChange: (o: PhoneOption) => void
        onPhoneChange: (v: string) => void
        onDryRunChange: (v: boolean) => void
        phoneInput: string
        dryRun: boolean
        phoneOptions: PhoneOption[]
    }) => (
        <div>
            <button onClick={() => onOptionChange(phoneOptions[0])}>
                Select phone
            </button>
            <input
                aria-label="phone number"
                value={phoneInput}
                onChange={(e) => onPhoneChange(e.target.value)}
            />
            <input
                type="checkbox"
                aria-label="dry run"
                checked={dryRun}
                onChange={(e) => onDryRunChange(e.target.checked)}
            />
        </div>
    ),
}))

const mockProductDispatchData: {
    shopifyProduct: Product | undefined
    body: string
    url: string
} = {
    shopifyProduct: undefined,
    body: '',
    url: '',
}

jest.mock('AIJourney/components/RcsMessageCard/RcsMessageCard', () => ({
    RcsMessageCard: ({
        form,
        dispatch,
    }: {
        form: {
            contextText: string
            buttons: {
                id: string
                text: string
                type: string
                value?: string
            }[]
            productEntries: { id: string; shopifyProduct: unknown }[]
        }
        dispatch: (action: unknown) => void
    }) => (
        <div>
            <input
                aria-label="context text"
                value={form.contextText}
                onChange={(e) =>
                    dispatch({ type: 'SET_TEXT', payload: e.target.value })
                }
            />
            <button onClick={() => dispatch({ type: 'ADD_BUTTON' })}>
                Add button
            </button>
            {form.buttons.map((button) => (
                <div key={button.id}>
                    <input
                        aria-label="button text"
                        value={button.text}
                        onChange={(e) =>
                            dispatch({
                                type: 'UPDATE_BUTTON',
                                id: button.id,
                                patch: { text: e.target.value },
                            })
                        }
                    />
                    <input
                        aria-label="button value"
                        value={button.value ?? ''}
                        onChange={(e) =>
                            dispatch({
                                type: 'UPDATE_BUTTON',
                                id: button.id,
                                patch: { value: e.target.value },
                            })
                        }
                    />
                    <button
                        onClick={() =>
                            dispatch({
                                type: 'UPDATE_BUTTON',
                                id: button.id,
                                patch: { type: 'URL' },
                            })
                        }
                    >
                        Set URL type
                    </button>
                    <button
                        onClick={() =>
                            dispatch({
                                type: 'UPDATE_BUTTON',
                                id: button.id,
                                patch: { type: 'QUICK_REPLY' },
                            })
                        }
                    >
                        Set QR type
                    </button>
                </div>
            ))}
            <button onClick={() => dispatch({ type: 'ADD_PRODUCT' })}>
                Add product
            </button>
            {form.productEntries.map((entry) => (
                <button
                    key={entry.id}
                    onClick={() =>
                        dispatch({
                            type: 'UPDATE_PRODUCT',
                            id: entry.id,
                            patch: {
                                shopifyProduct:
                                    mockProductDispatchData.shopifyProduct,
                                body: mockProductDispatchData.body,
                                url: mockProductDispatchData.url,
                            },
                        })
                    }
                >
                    Set product
                </button>
            ))}
        </div>
    ),
}))

const mockMutate = jest.fn()
const mockReset = jest.fn()

const defaultMutationState = {
    mutate: mockMutate,
    data: undefined,
    isLoading: false,
    error: null,
    reset: mockReset,
}

const renderComponent = () => render(<RcsTestSend />)

describe('<RcsTestSend />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()

        mockProductDispatchData.shopifyProduct = undefined
        mockProductDispatchData.body = ''
        mockProductDispatchData.url = ''

        jest.mocked(useParams).mockReturnValue({ shopName: 'my-store' })

        jest.mocked(useJourneyContext).mockReturnValue({
            storeConfiguration: { monitoredSmsIntegrations: [42] },
        } as ReturnType<typeof useJourneyContext>)

        jest.mocked(useAiJourneyPhoneList).mockReturnValue({
            marketingCapabilityPhoneNumbers: [],
        })

        jest.mocked(useRcsTestSend).mockReturnValue(
            defaultMutationState as unknown as ReturnType<
                typeof useRcsTestSend
            >,
        )
    })

    it('renders the page title and internal tool warning', () => {
        renderComponent()

        expect(screen.getByText('RCS Test Send')).toBeInTheDocument()
        expect(screen.getByText('Internal tool')).toBeInTheDocument()
        expect(
            screen.getByText('Available for impersonated sessions only'),
        ).toBeInTheDocument()
    })

    it('disables send button when form is incomplete', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Send RCS test' }),
        ).toBeDisabled()
    })

    it('enables send button when all required fields are filled', async () => {
        jest.mocked(useAiJourneyPhoneList).mockReturnValue({
            marketingCapabilityPhoneNumbers: [
                {
                    name: '[MKT] Test Phone',
                    phone_number: '+15551234567',
                    capabilities: { sms: true },
                    integrations: [{ id: 42, type: 'sms' }],
                },
            ] as ReturnType<
                typeof useAiJourneyPhoneList
            >['marketingCapabilityPhoneNumbers'],
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: 'Select phone' }))
        await user.type(
            screen.getByRole('textbox', { name: 'phone number' }),
            '5551234567',
        )
        await user.type(
            screen.getByRole('textbox', { name: 'context text' }),
            'Hello world',
        )

        expect(
            screen.getByRole('button', { name: 'Send RCS test' }),
        ).toBeEnabled()
    })

    it('calls mutate with correct payload on submit', async () => {
        jest.mocked(useAiJourneyPhoneList).mockReturnValue({
            marketingCapabilityPhoneNumbers: [
                {
                    name: '[MKT] Test Phone',
                    phone_number: '+15551234567',
                    capabilities: { sms: true },
                    integrations: [{ id: 42, type: 'sms' }],
                },
            ] as ReturnType<
                typeof useAiJourneyPhoneList
            >['marketingCapabilityPhoneNumbers'],
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: 'Select phone' }))
        await user.type(
            screen.getByRole('textbox', { name: 'phone number' }),
            '5551234567',
        )
        await user.type(
            screen.getByRole('textbox', { name: 'context text' }),
            'Hello world',
        )
        await user.click(screen.getByRole('button', { name: 'Send RCS test' }))

        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                integration_id: 42,
                recipient_phone: '+15551234567',
                dry_run: false,
                rcs_context: expect.objectContaining({ text: 'Hello world' }),
            }),
        )
    })

    it('shows "Sending..." label while loading', () => {
        jest.mocked(useRcsTestSend).mockReturnValue({
            ...defaultMutationState,
            isLoading: true,
        } as unknown as ReturnType<typeof useRcsTestSend>)

        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Sending...' }),
        ).toBeDisabled()
    })

    it('shows "Send (dry run)" label when dry run is enabled', async () => {
        jest.mocked(useAiJourneyPhoneList).mockReturnValue({
            marketingCapabilityPhoneNumbers: [
                {
                    name: '[MKT] Test Phone',
                    phone_number: '+15551234567',
                    capabilities: { sms: true },
                    integrations: [{ id: 42, type: 'sms' }],
                },
            ] as ReturnType<
                typeof useAiJourneyPhoneList
            >['marketingCapabilityPhoneNumbers'],
        })

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('checkbox', { name: 'dry run' }))

        expect(
            screen.getByRole('button', { name: 'Send (dry run)' }),
        ).toBeInTheDocument()
    })

    it('does not show clear button when no response or error', () => {
        renderComponent()

        expect(
            screen.queryByRole('button', { name: 'Clear' }),
        ).not.toBeInTheDocument()
    })

    it('shows clear button and response section when response is received', () => {
        const mockResponse: RcsTestSendResponse = {
            content_sid: null,
            template_name: null,
            variables: null,
            message_classification: 'text_only',
            resolution_path: 'exact',
            twilio_message_sid: null,
            warnings: [],
            templates_in_pool: null,
        }

        jest.mocked(useRcsTestSend).mockReturnValue({
            ...defaultMutationState,
            data: mockResponse,
        } as unknown as ReturnType<typeof useRcsTestSend>)

        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Clear' }),
        ).toBeInTheDocument()
        expect(screen.getByText('text_only')).toBeInTheDocument()
        expect(screen.getByText('exact')).toBeInTheDocument()
    })

    it('shows clear button and error message when mutation fails', () => {
        jest.mocked(useRcsTestSend).mockReturnValue({
            ...defaultMutationState,
            error: new Error('Request failed'),
        } as unknown as ReturnType<typeof useRcsTestSend>)

        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Clear' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Request failed')).toBeInTheDocument()
    })

    it('shows fallback error message for non-Error errors', () => {
        jest.mocked(useRcsTestSend).mockReturnValue({
            ...defaultMutationState,
            error: 'something went wrong',
        } as unknown as ReturnType<typeof useRcsTestSend>)

        renderComponent()

        expect(
            screen.getByText('An unexpected error occurred'),
        ).toBeInTheDocument()
    })

    it('renders the response section beside the banner for no-match errors', () => {
        const error = Object.assign(new Error('Bad'), {
            isAxiosError: true,
            toJSON: () => ({}),
            config: {},
            response: {
                status: 400,
                statusText: 'Bad Request',
                headers: {},
                config: {},
                data: {
                    error: {
                        msg: 'No matching RCS template for sub_account_sid=AC...',
                        data: {
                            content_sid: null,
                            template_name: null,
                            variables: null,
                            message_classification: 'rich_content',
                            resolution_path: 'none',
                            twilio_message_sid: null,
                            warnings: [],
                            templates_in_pool: 0,
                        },
                    },
                },
            },
        })

        jest.mocked(useRcsTestSend).mockReturnValue({
            ...defaultMutationState,
            error,
        } as unknown as ReturnType<typeof useRcsTestSend>)

        renderComponent()

        expect(screen.getByText('No matching RCS template')).toBeInTheDocument()
        expect(screen.getByText('Response')).toBeInTheDocument()
        expect(screen.getByText('rich_content')).toBeInTheDocument()
        expect(screen.getByText('none')).toBeInTheDocument()
    })

    it('renders field error JSON for validation failures', () => {
        const error = Object.assign(new Error('Bad'), {
            isAxiosError: true,
            toJSON: () => ({}),
            config: {},
            response: {
                status: 400,
                statusText: 'Bad Request',
                headers: {},
                config: {},
                data: {
                    error: {
                        msg: 'Failed to validate RCS test send request.',
                        data: { recipient_phone: ['must be E.164'] },
                    },
                },
            },
        })

        jest.mocked(useRcsTestSend).mockReturnValue({
            ...defaultMutationState,
            error,
        } as unknown as ReturnType<typeof useRcsTestSend>)

        renderComponent()

        expect(
            screen.getByText('Request validation failed'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/recipient_phone/, { selector: 'pre' }),
        ).toBeInTheDocument()
    })

    it('calls reset when clear button is clicked', async () => {
        jest.mocked(useRcsTestSend).mockReturnValue({
            ...defaultMutationState,
            data: {
                content_sid: null,
                template_name: null,
                variables: null,
                message_classification: 'text_only',
                resolution_path: 'exact',
                twilio_message_sid: null,
                warnings: [],
                templates_in_pool: null,
            },
        } as unknown as ReturnType<typeof useRcsTestSend>)

        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: 'Clear' }))

        expect(mockReset).toHaveBeenCalledTimes(1)
    })

    describe('rcsProducts mapping', () => {
        const withPhoneOptions = () => {
            jest.mocked(useAiJourneyPhoneList).mockReturnValue({
                marketingCapabilityPhoneNumbers: [
                    {
                        name: '[MKT] Test Phone',
                        phone_number: '+15551234567',
                        capabilities: { sms: true },
                        integrations: [{ id: 42, type: 'sms' }],
                    },
                ] as ReturnType<
                    typeof useAiJourneyPhoneList
                >['marketingCapabilityPhoneNumbers'],
            })
        }

        const fillRequiredFieldsAndAddProduct = async (
            user: ReturnType<typeof userEvent.setup>,
        ) => {
            await user.click(
                screen.getByRole('button', { name: 'Select phone' }),
            )
            await user.type(
                screen.getByRole('textbox', { name: 'phone number' }),
                '5551234567',
            )
            await user.type(
                screen.getByRole('textbox', { name: 'context text' }),
                'Hello',
            )
            await user.click(
                screen.getByRole('button', { name: 'Add product' }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Set product' }),
            )
            await user.click(screen.getByRole('button', { name: 'Add button' }))
            await user.type(
                screen.getByRole('textbox', { name: 'button text' }),
                'Shop',
            )
        }

        it('includes product with body, image, variant_id, and url', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = {
                id: 99,
                title: 'Test Shirt',
                image: {
                    src: 'https://cdn.shopify.com/img.jpg',
                    alt: null,
                    variant_ids: [],
                },
                variants: [{ id: 1001 }],
                images: [],
                options: [],
                created_at: '2024-01-01',
            } as unknown as Product
            mockProductDispatchData.body = 'Great product description'
            mockProductDispatchData.url =
                'https://my-store.myshopify.com/products/test-shirt'

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFieldsAndAddProduct(user)
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    rcs_context: expect.objectContaining({
                        products: [
                            {
                                title: 'Test Shirt',
                                body: 'Great product description',
                                image: 'https://cdn.shopify.com/img.jpg',
                                product_id: 99,
                                variant_id: 1001,
                                url: 'https://my-store.myshopify.com/products/test-shirt',
                            },
                        ],
                    }),
                }),
            )
        })

        it('omits body key when product body is empty', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = {
                id: 99,
                title: 'Test Shirt',
                image: null,
                variants: [{ id: 1001 }],
                images: [],
                options: [],
                created_at: '2024-01-01',
            } as unknown as Product
            mockProductDispatchData.body = ''
            mockProductDispatchData.url = 'https://example.com/product'

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFieldsAndAddProduct(user)
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            expect(call[0].rcs_context.products[0]).not.toHaveProperty('body')
        })

        it('uses empty string for image when product has no image', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = {
                id: 99,
                title: 'Test Shirt',
                image: null,
                variants: [{ id: 1001 }],
                images: [],
                options: [],
                created_at: '2024-01-01',
            } as unknown as Product
            mockProductDispatchData.body = 'Description'
            mockProductDispatchData.url = 'https://example.com'

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFieldsAndAddProduct(user)
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            expect(call[0].rcs_context.products[0].image).toBe('')
        })

        it('uses 0 for variant_id when product has no variants', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = {
                id: 99,
                title: 'Test Shirt',
                image: null,
                variants: [],
                images: [],
                options: [],
                created_at: '2024-01-01',
            } as unknown as Product
            mockProductDispatchData.body = 'Description'
            mockProductDispatchData.url = 'https://example.com'

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFieldsAndAddProduct(user)
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            expect(call[0].rcs_context.products[0].variant_id).toBe(0)
        })

        it('uses null for url when product url is empty', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = {
                id: 99,
                title: 'Test Shirt',
                image: null,
                variants: [{ id: 1001 }],
                images: [],
                options: [],
                created_at: '2024-01-01',
            } as unknown as Product
            mockProductDispatchData.body = 'Description'
            mockProductDispatchData.url = ''

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFieldsAndAddProduct(user)
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            expect(call[0].rcs_context.products[0].url).toBeNull()
        })

        it('uses null for url when product url is whitespace only', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = {
                id: 99,
                title: 'Test Shirt',
                image: null,
                variants: [{ id: 1001 }],
                images: [],
                options: [],
                created_at: '2024-01-01',
            } as unknown as Product
            mockProductDispatchData.body = 'Description'
            mockProductDispatchData.url = '   '

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFieldsAndAddProduct(user)
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            expect(call[0].rcs_context.products[0].url).toBeNull()
        })

        it('excludes product entries without a shopifyProduct from the payload', async () => {
            withPhoneOptions()

            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: 'Select phone' }),
            )
            await user.type(
                screen.getByRole('textbox', { name: 'phone number' }),
                '5551234567',
            )
            await user.type(
                screen.getByRole('textbox', { name: 'context text' }),
                'Hello',
            )
            await user.click(
                screen.getByRole('button', { name: 'Add product' }),
            )
            // Do NOT click "Set product" — entry has shopifyProduct: undefined
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            expect(call[0].rcs_context).not.toHaveProperty('products')
        })
    })

    describe('product + button validation', () => {
        const withPhoneOptions = () => {
            jest.mocked(useAiJourneyPhoneList).mockReturnValue({
                marketingCapabilityPhoneNumbers: [
                    {
                        name: '[MKT] Test Phone',
                        phone_number: '+15551234567',
                        capabilities: { sms: true },
                        integrations: [{ id: 42, type: 'sms' }],
                    },
                ] as ReturnType<
                    typeof useAiJourneyPhoneList
                >['marketingCapabilityPhoneNumbers'],
            })
        }

        const validProduct = {
            id: 99,
            title: 'Test Shirt',
            image: { src: 'https://cdn.shopify.com/img.jpg' },
            variants: [{ id: 1001 }],
            images: [],
            options: [],
            created_at: '2024-01-01',
        } as unknown as Product

        const fillRequiredFields = async (
            user: ReturnType<typeof userEvent.setup>,
        ) => {
            await user.click(
                screen.getByRole('button', { name: 'Select phone' }),
            )
            await user.type(
                screen.getByRole('textbox', { name: 'phone number' }),
                '5551234567',
            )
            await user.type(
                screen.getByRole('textbox', { name: 'context text' }),
                'Hello',
            )
        }

        it('disables send button when a product is set without any button', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = validProduct
            mockProductDispatchData.url = 'https://example.com/product'

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)
            await user.click(
                screen.getByRole('button', { name: 'Add product' }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Set product' }),
            )

            expect(
                screen.getByRole('button', { name: 'Send RCS test' }),
            ).toBeDisabled()
        })

        it('shows guidance when a product is set without any button', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = validProduct
            mockProductDispatchData.url = 'https://example.com/product'

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)
            await user.click(
                screen.getByRole('button', { name: 'Add product' }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Set product' }),
            )

            expect(
                screen.getByText(
                    /Carousels and product cards require at least one button/,
                ),
            ).toBeInTheDocument()
        })

        it('enables send button once a button with text is added alongside the product', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = validProduct
            mockProductDispatchData.url = 'https://example.com/product'

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)
            await user.click(
                screen.getByRole('button', { name: 'Add product' }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Set product' }),
            )
            await user.click(screen.getByRole('button', { name: 'Add button' }))
            await user.type(
                screen.getByRole('textbox', { name: 'button text' }),
                'Shop',
            )

            expect(
                screen.getByRole('button', { name: 'Send RCS test' }),
            ).toBeEnabled()
        })

        it('still allows sending text-only with no products and no buttons', async () => {
            withPhoneOptions()

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)

            expect(
                screen.getByRole('button', { name: 'Send RCS test' }),
            ).toBeEnabled()
        })

        it('does not show the guidance message when no product is set', async () => {
            withPhoneOptions()

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)

            expect(
                screen.queryByText(
                    /Carousels and product cards require at least one button/,
                ),
            ).not.toBeInTheDocument()
        })

        it('treats an empty product entry as no product (send remains enabled without a button)', async () => {
            withPhoneOptions()

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)
            await user.click(
                screen.getByRole('button', { name: 'Add product' }),
            )
            // Intentionally skip "Set product" — entry has shopifyProduct: undefined

            expect(
                screen.getByRole('button', { name: 'Send RCS test' }),
            ).toBeEnabled()
        })

        it('treats whitespace-only button text as no button (send stays disabled)', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = validProduct
            mockProductDispatchData.url = 'https://example.com/product'

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)
            await user.click(
                screen.getByRole('button', { name: 'Add product' }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Set product' }),
            )
            await user.click(screen.getByRole('button', { name: 'Add button' }))
            await user.type(
                screen.getByRole('textbox', { name: 'button text' }),
                '   ',
            )

            expect(
                screen.getByRole('button', { name: 'Send RCS test' }),
            ).toBeDisabled()
        })
    })

    describe('buttons mapping', () => {
        const withPhoneOptions = () => {
            jest.mocked(useAiJourneyPhoneList).mockReturnValue({
                marketingCapabilityPhoneNumbers: [
                    {
                        name: '[MKT] Test Phone',
                        phone_number: '+15551234567',
                        capabilities: { sms: true },
                        integrations: [{ id: 42, type: 'sms' }],
                    },
                ] as ReturnType<
                    typeof useAiJourneyPhoneList
                >['marketingCapabilityPhoneNumbers'],
            })
        }

        const fillRequiredFields = async (
            user: ReturnType<typeof userEvent.setup>,
        ) => {
            await user.click(
                screen.getByRole('button', { name: 'Select phone' }),
            )
            await user.type(
                screen.getByRole('textbox', { name: 'phone number' }),
                '5551234567',
            )
            await user.type(
                screen.getByRole('textbox', { name: 'context text' }),
                'Hello',
            )
        }

        it('omits id from buttons in the payload', async () => {
            withPhoneOptions()
            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)
            await user.click(screen.getByRole('button', { name: 'Add button' }))
            await user.type(
                screen.getByRole('textbox', { name: 'button text' }),
                'Click me',
            )
            await user.click(
                screen.getByRole('button', { name: 'Set URL type' }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            const buttons = call[0].rcs_context.buttons
            expect(buttons).toHaveLength(1)
            expect(buttons[0]).not.toHaveProperty('id')
            expect(buttons[0]).toMatchObject({
                type: 'URL',
                text: 'Click me',
            })
        })

        it('preserves URL button value when no product is attached', async () => {
            withPhoneOptions()
            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)
            await user.click(screen.getByRole('button', { name: 'Add button' }))
            await user.type(
                screen.getByRole('textbox', { name: 'button text' }),
                'Open',
            )
            await user.click(
                screen.getByRole('button', { name: 'Set URL type' }),
            )
            await user.type(
                screen.getByRole('textbox', { name: 'button value' }),
                'https://example.com/landing',
            )
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            expect(call[0].rcs_context.buttons[0]).toMatchObject({
                type: 'URL',
                text: 'Open',
                value: 'https://example.com/landing',
            })
        })

        it('blanks URL button value when a product carries a URL', async () => {
            withPhoneOptions()
            mockProductDispatchData.shopifyProduct = {
                id: 99,
                title: 'Test Shirt',
                image: {
                    src: 'https://cdn.shopify.com/img.jpg',
                    alt: null,
                    variant_ids: [],
                },
                variants: [{ id: 1001 }],
                images: [],
                options: [],
                created_at: '2024-01-01',
            } as unknown as Product
            mockProductDispatchData.body = ''
            mockProductDispatchData.url =
                'https://my-store.myshopify.com/products/test-shirt'

            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)
            await user.click(
                screen.getByRole('button', { name: 'Add product' }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Set product' }),
            )
            await user.click(screen.getByRole('button', { name: 'Add button' }))
            await user.type(
                screen.getByRole('textbox', { name: 'button text' }),
                'Shop',
            )
            await user.click(
                screen.getByRole('button', { name: 'Set URL type' }),
            )
            await user.type(
                screen.getByRole('textbox', { name: 'button value' }),
                'https://override.example.com',
            )
            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            expect(call[0].rcs_context.buttons[0]).toEqual({
                type: 'URL',
                text: 'Shop',
                value: '',
            })
        })

        it('blanks Quick Reply value regardless of products', async () => {
            withPhoneOptions()
            const user = userEvent.setup()
            renderComponent()

            await fillRequiredFields(user)
            // Two QR buttons → validateTemplateInputs treats this as valid
            // (a single QR with no other trigger is rejected as
            // template-degraded).
            await user.click(screen.getByRole('button', { name: 'Add button' }))
            const textInputs = screen.getAllByRole('textbox', {
                name: 'button text',
            })
            await user.type(textInputs[0], 'Reply')
            await user.click(
                screen.getAllByRole('button', { name: 'Set QR type' })[0],
            )
            const valueInputs = screen.getAllByRole('textbox', {
                name: 'button value',
            })
            await user.type(valueInputs[0], 'some-payload')

            await user.click(screen.getByRole('button', { name: 'Add button' }))
            const textInputsAfter = screen.getAllByRole('textbox', {
                name: 'button text',
            })
            await user.type(textInputsAfter[1], 'Other')
            await user.click(
                screen.getAllByRole('button', { name: 'Set QR type' })[1],
            )

            await user.click(
                screen.getByRole('button', { name: 'Send RCS test' }),
            )

            const [call] = mockMutate.mock.calls
            expect(call[0].rcs_context.buttons).toEqual([
                { type: 'QUICK_REPLY', text: 'Reply', value: '' },
                { type: 'QUICK_REPLY', text: 'Other', value: '' },
            ])
        })
    })
})
