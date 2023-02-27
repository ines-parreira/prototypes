import MockAdapter from 'axios-mock-adapter'
import {
    bigCommerceCartFixture,
    bigCommerceCustomerFixture,
    bigCommerceProductFixture,
    bigCommerceVariantFixture,
} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import {
    BigCommerceCartResponse,
    BigCommerceLineItemError,
    BigCommerceNestedCartResponse,
    BigCommerceProduct,
    ProductModifiersChangedError,
} from 'models/integration/types'
import {
    onCancel,
    onInit,
    // onReset,
    exportedForTesting,
    addLineItem,
    removeRow,
    updateRow,
    updateLineItemModifiers,
} from '../utils'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

describe('utils', () => {
    let apiMock: MockAdapter

    beforeEach(() => {
        jest.resetAllMocks()
        apiMock = new MockAdapter(client)
    })

    afterAll(() => {
        apiMock.restore()
    })

    const cart = bigCommerceCartFixture()
    const cartResponse = {
        cart: bigCommerceCartFixture(),
    }
    const nestedCartResponse = {
        data: {cart: bigCommerceCartFixture()},
    }
    const integrationId = 1
    const customer = bigCommerceCustomerFixture()
    const product = bigCommerceProductFixture()
    const variant = bigCommerceVariantFixture()
    const currency = 'USD'
    const index = 0
    const newQuantity = 2
    const products = new Map<number, BigCommerceProduct>()
    products.set(product.id, product)

    const setIsLoading = jest.fn()
    const setCart = jest.fn()
    const setProducts = jest.fn()
    const logErrors = jest.fn()

    describe('onInit', () => {
        it('should init the order modal', async () => {
            apiMock.onAny().reply(200, cartResponse)

            const setIsLoadingMock = jest.fn()
            const setCartMock = jest.fn()

            await onInit({
                customer,
                integrationId,
                currency,
                setIsLoading: setIsLoadingMock,
                setCart: setCartMock,
            })

            expect(setCartMock).toHaveBeenCalledWith(cart)
            expect(setIsLoadingMock).toHaveBeenCalledWith(false)
        })
    })

    describe('onCancel', () => {
        it('should handle pressing cancel button', () => {
            apiMock.onAny().reply(204)

            const setCartMock = jest.fn()

            onCancel({
                integrationId,
                via: 'footer',
                cart,
                setCart: setCartMock,
            })

            expect(setCartMock).toHaveBeenCalledWith(null)
        })
    })

    describe('createCart', () => {
        it('should create the cart', async () => {
            apiMock.onAny().reply(200, cartResponse)

            const newCart = await exportedForTesting.createCart({
                integrationId,
                customer,
                currency,
            })

            expect(newCart).toStrictEqual(cart)
        })
    })

    describe('addLineItem', () => {
        it('should add a line item to the cart', async () => {
            apiMock.onAny().reply<BigCommerceCartResponse>(200, {cart})

            const setIsLoadingMock = jest.fn()
            const setProductsMock = jest.fn()
            const setCartMock = jest.fn()

            await addLineItem({
                integrationId,
                product,
                variant,
                cart,
                products,
                setIsLoading: setIsLoadingMock,
                setCart: setCartMock,
                setProducts: setProductsMock,
                logErrors,
            })

            expect(setIsLoadingMock).toHaveBeenCalledTimes(2)
            expect(setProductsMock).toHaveBeenCalled()
            expect(setCartMock).toHaveBeenCalledWith(cart)
        })

        it('should throw product modifiers error', async () => {
            const mockProduct = {...bigCommerceProductFixture()}

            apiMock.onAny().reply<BigCommerceCartResponse>(422, {
                error: {
                    data: {
                        // @ts-ignore
                        cart: {},
                        updated_product: mockProduct,
                    },
                    msg: 'Some error',
                },
            })

            const setIsLoadingMock = jest.fn()
            const setProductsMock = jest.fn()
            const setCartMock = jest.fn()

            await expect(
                addLineItem({
                    integrationId,
                    product,
                    variant,
                    cart,
                    products,
                    setIsLoading: setIsLoadingMock,
                    setCart: setCartMock,
                    setProducts: setProductsMock,
                    logErrors,
                })
            ).rejects.toThrow(ProductModifiersChangedError)

            expect(setIsLoadingMock).toHaveBeenCalledTimes(2)
            expect(setProductsMock).not.toHaveBeenCalled()
            expect(setCartMock).not.toHaveBeenCalled()
        })

        it('should set an error because quantity is more than stock', async () => {
            apiMock.onAny().reply<BigCommerceCartResponse>(422, {
                error: {
                    data: {cart},
                    msg: 'Invalid quantity selected. Please adjust product quantity.',
                },
            })

            const setIsLoadingMock = jest.fn()
            const logErrorsMock = jest.fn()

            await addLineItem({
                integrationId: integrationId,
                product: product,
                variant: variant,
                setIsLoading: setIsLoadingMock,
                cart,
                setCart,
                products,
                setProducts,
                logErrors: logErrorsMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalledTimes(2)
            expect(logErrorsMock).toHaveBeenCalledWith(
                'modal',
                `Invalid quantity selected for <b>${product.name}</b>. Please adjust product quantity.`,
                `${product.id}_${variant?.id}`
            )
        })
    })

    describe('removeRow', () => {
        it('should remove a row from the cart', async () => {
            apiMock.onAny().reply(200, nestedCartResponse)

            const setIsLoadingMock = jest.fn()
            const setCartMock = jest.fn()
            const logErrorsMock = jest.fn()

            await removeRow({
                integrationId,
                index,
                cart,
                setIsLoading: setIsLoadingMock,
                setCart: setCartMock,
                logErrors: logErrorsMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setCartMock).toHaveBeenCalled()
            expect(logErrorsMock).toHaveBeenCalled()
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
            logErrors,
        }

        it('should update a row from the cart', async () => {
            const cart = bigCommerceCartFixture()

            apiMock.onAny().reply<BigCommerceNestedCartResponse>(200, {
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
            const logErrorsMock = jest.fn()

            await expect(() =>
                updateRow({
                    ...defaultProps,
                    setIsLoading: setIsLoadingMock,
                    logErrors: logErrorsMock,
                })
            ).rejects.toThrow()

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(logErrorsMock).toHaveBeenCalled()
        })

        it('should set an error because error field was returned', async () => {
            apiMock.onAny().reply<BigCommerceNestedCartResponse>(422, {
                error: {
                    // @ts-ignore
                    data: {cart: {}},
                    msg: 'Invalid quantity selected. Please adjust product quantity.',
                },
            })

            const setIsLoadingMock = jest.fn()
            const logErrorsMock = jest.fn()

            await expect(() =>
                updateRow({
                    ...defaultProps,
                    setIsLoading: setIsLoadingMock,
                    logErrors: logErrorsMock,
                })
            ).rejects.toThrow(
                new BigCommerceLineItemError(
                    'Invalid quantity selected. Please adjust product quantity.'
                )
            )

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(logErrorsMock).toHaveBeenCalled()
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
            logErrors,
        }

        it('should update line item modifiers', async () => {
            const cart = bigCommerceCartFixture()

            apiMock.onAny().reply<BigCommerceNestedCartResponse>(200, {
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
            apiMock.onAny().reply<BigCommerceNestedCartResponse>(422, {
                error: {
                    // @ts-ignore
                    data: {cart: {}},
                    msg: '[BIGCOMMERCE][some_action] BigCommerce API has returned an error: (422): Doing very bad my friend.',
                },
            })

            const setIsLoadingMock = jest.fn()
            const logErrorsMock = jest.fn()

            await expect(() =>
                updateLineItemModifiers({
                    ...defaultProps,
                    setIsLoading: setIsLoadingMock,
                    logErrors: logErrorsMock,
                })
            ).rejects.toThrow(
                new BigCommerceLineItemError('Product could not be updated.')
            )

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setIsLoadingMock).toHaveBeenCalled()
        })
    })
})
