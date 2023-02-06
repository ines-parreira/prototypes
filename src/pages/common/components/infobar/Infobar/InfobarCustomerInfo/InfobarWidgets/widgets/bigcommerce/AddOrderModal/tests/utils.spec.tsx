import MockAdapter from 'axios-mock-adapter'
import {
    bigCommerceCartFixture,
    bigCommerceCustomerFixture,
    BigCommerceNestedCartFixture,
    bigCommerceProductFixture,
    bigCommerceVariantFixture,
} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import {BigCommerceProduct} from 'models/integration/types'
import {
    EditBigCommerceLineItemError,
    EditLineItemResponse,
} from 'models/integration/resources/bigcommerce'
import {
    onCancel,
    onInit,
    // onReset,
    exportedForTesting,
    addRow,
    removeRow,
    updateRow,
    updateLineItemModifiers,
} from '../utils'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

describe('utils', () => {
    let apiMock: MockAdapter

    beforeEach(() => {
        apiMock = new MockAdapter(client)
    })

    afterAll(() => {
        apiMock.restore()
    })

    const cart = bigCommerceCartFixture()
    const nestedResponse = BigCommerceNestedCartFixture()
    const integrationId = 1
    const customer = bigCommerceCustomerFixture()
    const product = bigCommerceProductFixture()
    const variant = bigCommerceVariantFixture()
    const currency = 'USD'
    const index = 0
    const newQuantity = 2
    const products = new Map<number, BigCommerceProduct>()
    products.set(product.id, product)

    const setCart = jest.fn()
    const setIsLoading = jest.fn()
    const setProducts = jest.fn()
    const setLineItemWithError = jest.fn()

    describe('onInit', () => {
        it('should init the order modal', async () => {
            apiMock.onAny().reply(200, cart)

            await onInit({
                customer,
                integrationId,
                currency,
                setIsLoading,
                setCart,
            })

            expect(setCart).toHaveBeenCalledWith(cart)
            expect(setIsLoading).toHaveBeenCalledWith(false)
        })
    })

    describe('onCancel', () => {
        it('should handle pressing cancel button', () => {
            onCancel({integrationId, via: 'footer', cart, setCart})
            apiMock.onAny().reply(204)

            expect(setCart).toHaveBeenCalledWith(null)
        })
    })

    describe('createCart', () => {
        it('should create the cart', async () => {
            apiMock.onAny().reply(200, cart)

            const newCart = await exportedForTesting.createCart({
                integrationId,
                customer,
                currency,
            })
            expect(newCart).toStrictEqual(cart)
        })
    })

    describe('addRow', () => {
        it('should add a row to the cart', async () => {
            apiMock.onAny().reply(200, cart)

            await addRow({
                integrationId,
                lineProduct: product,
                variant: variant,
                setIsLoading,
                cart,
                setCart,
                products,
                setProducts,
                setLineItemWithError,
            })

            expect(setIsLoading).toHaveBeenCalled()
            expect(setProducts).toHaveBeenCalled()
            expect(setCart).toHaveBeenCalled()
        })

        it('should set an error because quantity is more than stock', async () => {
            apiMock.onAny().reply(422, cart)

            await addRow({
                integrationId: integrationId,
                lineProduct: product,
                variant: variant,
                setIsLoading,
                cart,
                setCart,
                products,
                setProducts,
                setLineItemWithError,
            })

            expect(setIsLoading).toHaveBeenCalled()
            expect(setLineItemWithError).toHaveBeenCalled()
        })
    })

    describe('removeRow', () => {
        it('should remove a row from the cart', async () => {
            apiMock.onAny().reply(200, nestedResponse)
            await removeRow({
                integrationId,
                index,
                setIsLoading,
                cart,
                setCart,
                setLineItemWithError,
            })

            expect(setIsLoading).toHaveBeenCalled()
            expect(setCart).toHaveBeenCalled()
            expect(setLineItemWithError).toHaveBeenCalledWith({
                id: null,
                message: '',
            })
        })
    })

    describe('updateRow', () => {
        const defaultProps = {
            integrationId,
            index,
            quantity: newQuantity,
            cart,
            setIsLoading,
            setCart,
            setLineItemWithError,
        }

        it('should update a row from the cart', async () => {
            const cart = bigCommerceCartFixture()

            apiMock.onAny().reply<EditLineItemResponse>(200, {
                data: {cart: bigCommerceCartFixture()},
            })

            const setIsLoadingMock = jest.fn()
            const setCartMock = jest.fn()

            await updateRow({
                ...defaultProps,
                setIsLoading: setIsLoadingMock,
                setCart: setCartMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setCartMock).toHaveBeenCalledWith(cart)
        })

        it('should set an error because error was thrown', async () => {
            apiMock.onAny().reply(422)

            const setIsLoadingMock = jest.fn()
            const setLineItemWithErrorMock = jest.fn()

            await expect(() =>
                updateRow({
                    ...defaultProps,
                    setIsLoading: setIsLoadingMock,
                    setLineItemWithError: setLineItemWithErrorMock,
                })
            ).rejects.toThrow()

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setLineItemWithErrorMock).toHaveBeenCalled()
        })

        it('should set an error because error field was returned', async () => {
            apiMock.onAny().reply<EditLineItemResponse>(200, {
                data: {
                    cart: {},
                    error: '[BIGCOMMERCE][update_line_item_from_cart] BigCommerce API has returned an error: (422): You can only purchase a maximum of 10 of the whatsupp33 per order.',
                },
            })

            const setIsLoadingMock = jest.fn()
            const setLineItemWithErrorMock = jest.fn()

            await expect(() =>
                updateRow({
                    ...defaultProps,
                    setIsLoading: setIsLoadingMock,
                    setLineItemWithError: setLineItemWithErrorMock,
                })
            ).rejects.toThrow(
                new EditBigCommerceLineItemError(
                    'You can only purchase a maximum of 10 of the whatsupp33 per order.'
                )
            )

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setLineItemWithErrorMock).toHaveBeenCalled()
        })
    })

    describe('updateLineItemModifiers', () => {
        const defaultProps = {
            integrationId,
            index,
            quantity: newQuantity,
            optionSelections: [],
            cart,
            setIsLoading,
            setCart,
            setLineItemWithError,
        }

        it('should update line item modifiers', async () => {
            const cart = bigCommerceCartFixture()

            apiMock.onAny().reply<EditLineItemResponse>(200, {
                data: {cart: bigCommerceCartFixture()},
            })

            const setIsLoadingMock = jest.fn()
            const setCartMock = jest.fn()

            await updateLineItemModifiers({
                ...defaultProps,
                setIsLoading: setIsLoadingMock,
                setCart: setCartMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setCartMock).toHaveBeenCalledWith(cart)
        })

        it('should set an error because error field was returned', async () => {
            apiMock.onAny().reply<EditLineItemResponse>(200, {
                data: {
                    cart: {},
                    error: '[BIGCOMMERCE][some_action] BigCommerce API has returned an error: (422): Doing very bad my friend.',
                },
            })

            const setIsLoadingMock = jest.fn()
            const setLineItemWithErrorMock = jest.fn()

            await expect(() =>
                updateLineItemModifiers({
                    ...defaultProps,
                    setIsLoading: setIsLoadingMock,
                    setLineItemWithError: setLineItemWithErrorMock,
                })
            ).rejects.toThrow(
                new EditBigCommerceLineItemError('Doing very bad my friend.')
            )

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setLineItemWithErrorMock).toHaveBeenCalled()
        })
    })
})
