import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { MessageFormState } from 'AIJourney/types/RcsTestSend'

import { INITIAL_FORM } from '../../pages/RcsTestSend/reducer'
import { RcsMessageCard } from './RcsMessageCard'

const mockSelectProduct = jest.fn()

jest.mock('AIJourney/components/ProductSelect/ProductSelect', () => ({
    ProductSelect: ({
        setSelectedProduct,
    }: {
        setSelectedProduct: (p: unknown) => void
    }) => {
        mockSelectProduct.mockImplementation(setSelectedProduct)
        return (
            <button onClick={() => mockSelectProduct()}>Select product</button>
        )
    },
}))

const mockDispatch = jest.fn()

const defaultProps = {
    form: INITIAL_FORM,
    dispatch: mockDispatch,
    shopName: 'my-store.myshopify.com',
}

const renderComponent = (form: MessageFormState = INITIAL_FORM) =>
    render(
        <RcsMessageCard
            {...defaultProps}
            form={form}
            dispatch={mockDispatch}
        />,
    )

describe('<MessageCard />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the Message card header', () => {
        renderComponent()

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('renders the Text field with required caption', () => {
        renderComponent()

        expect(screen.getByLabelText(/^Text/)).toBeInTheDocument()
        expect(screen.getByText('Required — message body')).toBeInTheDocument()
    })

    it('disables the Title field and explains why when no card trigger is set', () => {
        renderComponent()

        expect(screen.getByLabelText(/^Title/)).toBeDisabled()
        expect(
            screen.getByText(/Add an image, button, or product first\./),
        ).toBeInTheDocument()
    })

    it('enables the Title field once an image is set', () => {
        renderComponent({ ...INITIAL_FORM, image: 'https://example.com/i.png' })

        expect(screen.getByLabelText(/^Title/)).toBeEnabled()
        expect(
            screen.getByText('Optional — rich card title'),
        ).toBeInTheDocument()
    })

    it('renders the Image URL field', () => {
        renderComponent()

        expect(screen.getByLabelText('Image URL')).toBeInTheDocument()
    })

    it('dispatches SET_TEXT when text field changes', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.type(screen.getByLabelText(/^Text/), 'Hello')

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_TEXT',
            payload: expect.stringContaining('H'),
        })
    })

    it('dispatches SET_TITLE when title field changes', async () => {
        const user = userEvent.setup()
        renderComponent({ ...INITIAL_FORM, image: 'https://example.com/i.png' })

        await user.type(screen.getByLabelText(/^Title/), 'My Title')

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_TITLE',
            payload: expect.stringContaining('M'),
        })
    })

    it('dispatches SET_IMAGE when image URL field changes', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.type(
            screen.getByLabelText('Image URL'),
            'https://example.com/img.png',
        )

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_IMAGE',
            payload: expect.stringContaining('h'),
        })
    })

    it('shows "Add button" button when fewer than 5 buttons exist', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /add button/i }),
        ).toBeInTheDocument()
    })

    it('dispatches ADD_BUTTON when "Add button" is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /add button/i }))

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_BUTTON' })
    })

    it('hides "Add button" when 5 buttons already exist', () => {
        const formWith5Buttons: MessageFormState = {
            ...INITIAL_FORM,
            buttons: Array.from({ length: 5 }, (_, i) => ({
                id: `btn-${i}`,
                type: 'QUICK_REPLY',
                text: `Button ${i}`,
                value: '',
            })),
        }

        renderComponent(formWith5Buttons)

        expect(
            screen.queryByRole('button', { name: /add button/i }),
        ).not.toBeInTheDocument()
    })

    it('renders existing buttons with Remove button', () => {
        const formWithButton: MessageFormState = {
            ...INITIAL_FORM,
            buttons: [
                { id: 'b1', type: 'QUICK_REPLY', text: 'Buy now', value: '' },
            ],
        }

        renderComponent(formWithButton)

        expect(screen.getByText('Button 1')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Remove' }),
        ).toBeInTheDocument()
    })

    it('dispatches REMOVE_BUTTON when Remove is clicked on a button entry', async () => {
        const formWithButton: MessageFormState = {
            ...INITIAL_FORM,
            buttons: [
                { id: 'b1', type: 'QUICK_REPLY', text: 'Buy now', value: '' },
            ],
        }

        const user = userEvent.setup()
        renderComponent(formWithButton)

        await user.click(screen.getByRole('button', { name: 'Remove' }))

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'REMOVE_BUTTON',
            id: 'b1',
        })
    })

    it('shows "Add product" button when fewer than 10 products exist', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /add product/i }),
        ).toBeInTheDocument()
    })

    it('dispatches ADD_PRODUCT when "Add product" is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /add product/i }))

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_PRODUCT' })
    })

    it('disables "Add product" and shows note when image URL is set', () => {
        const formWithImage: MessageFormState = {
            ...INITIAL_FORM,
            image: 'https://example.com/img.png',
        }

        renderComponent(formWithImage)

        expect(
            screen.getByRole('button', { name: /add product/i }),
        ).toBeDisabled()
        expect(
            screen.getByText('Clear the image to add products'),
        ).toBeInTheDocument()
    })

    it('disables image URL field when products are present', () => {
        const formWithProduct: MessageFormState = {
            ...INITIAL_FORM,
            productEntries: [
                {
                    id: 'p1',
                    shopifyProduct: {
                        id: 1,
                        title: 'T-Shirt',
                        handle: 't-shirt',
                        body_html: '',
                        variants: [],
                        image: null,
                        images: [],
                        options: [],
                        created_at: '2024-01-01',
                    },
                    body: '',
                    url: '',
                },
            ],
        }

        renderComponent(formWithProduct)

        expect(screen.getByLabelText('Image URL')).toBeDisabled()
        expect(
            screen.getByText('Cannot be used together with products'),
        ).toBeInTheDocument()
    })

    it('hides "Add product" when 10 products already exist', () => {
        const formWith10Products: MessageFormState = {
            ...INITIAL_FORM,
            productEntries: Array.from({ length: 10 }, (_, i) => ({
                id: `p-${i}`,
                shopifyProduct: undefined,
                body: '',
                url: '',
            })),
        }

        renderComponent(formWith10Products)

        expect(
            screen.queryByRole('button', { name: /add product/i }),
        ).not.toBeInTheDocument()
    })

    describe('product selection', () => {
        const formWithProductEntry: MessageFormState = {
            ...INITIAL_FORM,
            productEntries: [
                {
                    id: 'p1',
                    shopifyProduct: undefined,
                    body: 'existing body',
                    url: 'https://existing.url',
                },
            ],
        }

        it('dispatches UPDATE_PRODUCT with stripped body and constructed URL', () => {
            renderComponent(formWithProductEntry)

            mockSelectProduct({
                id: 99,
                title: 'Cool Shirt',
                body_html: '<b>Great product</b>',
                handle: 'cool-shirt',
                variants: [],
                images: [],
                image: null,
                options: [],
                created_at: '2024-01-01',
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'UPDATE_PRODUCT',
                id: 'p1',
                patch: {
                    shopifyProduct: expect.objectContaining({ id: 99 }),
                    body: 'Great product',
                    url: 'https://my-store.myshopify.com/products/cool-shirt',
                },
            })
        })

        it('falls back to entry body when product has no body_html', () => {
            renderComponent(formWithProductEntry)

            mockSelectProduct({
                id: 99,
                title: 'Cool Shirt',
                handle: 'cool-shirt',
                variants: [],
                images: [],
                image: null,
                options: [],
                created_at: '2024-01-01',
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    patch: expect.objectContaining({ body: 'existing body' }),
                }),
            )
        })

        it('falls back to entry url when product has no handle', () => {
            renderComponent(formWithProductEntry)

            mockSelectProduct({
                id: 99,
                title: 'Cool Shirt',
                body_html: '<p>Description</p>',
                variants: [],
                images: [],
                image: null,
                options: [],
                created_at: '2024-01-01',
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    patch: expect.objectContaining({
                        url: 'https://existing.url',
                    }),
                }),
            )
        })

        it('falls back to both entry values when product has no body_html and no handle', () => {
            renderComponent(formWithProductEntry)

            mockSelectProduct({
                id: 99,
                title: 'Bare Product',
                variants: [],
                images: [],
                image: null,
                options: [],
                created_at: '2024-01-01',
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'UPDATE_PRODUCT',
                id: 'p1',
                patch: {
                    shopifyProduct: expect.objectContaining({ id: 99 }),
                    body: 'existing body',
                    url: 'https://existing.url',
                },
            })
        })

        it('dispatches UPDATE_PRODUCT with undefined product and falls back to entry values', async () => {
            const user = userEvent.setup()
            renderComponent(formWithProductEntry)

            await user.click(
                screen.getByRole('button', { name: 'Select product' }),
            )

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'UPDATE_PRODUCT',
                id: 'p1',
                patch: {
                    shopifyProduct: undefined,
                    body: 'existing body',
                    url: 'https://existing.url',
                },
            })
        })

        it('dispatches UPDATE_PRODUCT with body when body field changes', async () => {
            const user = userEvent.setup()
            renderComponent(formWithProductEntry)

            await user.type(screen.getByLabelText('Body'), 'Updated body')

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'UPDATE_PRODUCT',
                id: 'p1',
                patch: { body: expect.stringContaining('U') },
            })
        })

        it('dispatches UPDATE_PRODUCT with url when URL field changes', async () => {
            const user = userEvent.setup()
            renderComponent(formWithProductEntry)

            await user.type(screen.getByLabelText('URL'), 'https://new.url')

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'UPDATE_PRODUCT',
                id: 'p1',
                patch: { url: expect.stringContaining('h') },
            })
        })

        it('dispatches REMOVE_PRODUCT when Remove is clicked on a product entry', async () => {
            const user = userEvent.setup()
            renderComponent(formWithProductEntry)

            await user.click(screen.getByRole('button', { name: 'Remove' }))

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'REMOVE_PRODUCT',
                id: 'p1',
            })
        })
    })

    describe('button value field gating', () => {
        const productWithUrl: MessageFormState['productEntries'][number] = {
            id: 'p1',
            shopifyProduct: {
                id: 1,
                title: 'T-Shirt',
                handle: 't-shirt',
                body_html: '',
                variants: [],
                image: null,
                images: [],
                options: [],
                created_at: '2024-01-01',
            } as MessageFormState['productEntries'][number]['shopifyProduct'],
            body: '',
            url: 'https://shop.example.com/p/t-shirt',
        }

        it('disables Value on a Quick Reply button with the encoded-payload caption', () => {
            renderComponent({
                ...INITIAL_FORM,
                buttons: [
                    {
                        id: 'b1',
                        type: 'QUICK_REPLY',
                        text: 'Buy now',
                        value: '',
                    },
                ],
            })

            expect(screen.getByLabelText('Value')).toBeDisabled()
            expect(
                screen.getByText(
                    /Quick Reply payload is encoded from the selected product\./,
                ),
            ).toBeInTheDocument()
        })

        it('enables Value on a URL button when no product carries a URL', () => {
            renderComponent({
                ...INITIAL_FORM,
                buttons: [{ id: 'b1', type: 'URL', text: 'Open', value: '' }],
            })

            expect(screen.getByLabelText('Value')).toBeEnabled()
            expect(
                screen.getByText('Destination URL opened when tapped.'),
            ).toBeInTheDocument()
        })

        it('disables Value on a URL button when an attached product carries a URL', () => {
            renderComponent({
                ...INITIAL_FORM,
                buttons: [{ id: 'b1', type: 'URL', text: 'Shop', value: '' }],
                productEntries: [productWithUrl],
            })

            expect(screen.getByLabelText('Value')).toBeDisabled()
            expect(
                screen.getByText(/URL ignored when products are attached/),
            ).toBeInTheDocument()
        })
    })
})
