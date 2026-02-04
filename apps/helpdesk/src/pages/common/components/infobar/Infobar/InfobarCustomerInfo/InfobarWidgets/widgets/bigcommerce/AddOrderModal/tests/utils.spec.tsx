import MockAdapter from 'axios-mock-adapter'

import {
    bigCommerceCartFixture,
    bigCommerceCustomerFixture,
    bigCommerceCustomLineItemFixture,
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
    bigCommerceVariantFixture,
} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import type {
    BigCommerceCartResponse,
    BigCommerceNestedCartResponse,
    BigCommerceProduct,
} from 'models/integration/types'
import {
    BigCommerceActionType,
    BigCommerceLineItemError,
    ProductModifiersChangedError,
} from 'models/integration/types'

import {
    addLineItem,
    exportedForTesting,
    getAvailableLineItems,
    onCancel,
    onInit,
    onReset,
    removeRow,
    updateLineItemModifiers,
    updateRow,
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
        data: { cart: bigCommerceCartFixture() },
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
    const setModalErrors = jest.fn()

    describe('getAvailableLineItems', () => {
        it('should filter line items by not having a parentId', () => {
            const bundledBigCommerceLineItem = bigCommerceLineItemFixture()
            bundledBigCommerceLineItem.parent_id = 1

            const availableLineItems = getAvailableLineItems([
                bigCommerceLineItemFixture(),
                bigCommerceCustomLineItemFixture,
                bundledBigCommerceLineItem,
            ])

            expect(availableLineItems).toEqual([
                bigCommerceLineItemFixture(),
                bigCommerceCustomLineItemFixture,
            ])
        })
    })
    describe('onInit', () => {
        it('should init the order modal', async () => {
            apiMock.onAny().reply(200, cartResponse)

            const setCartMock = jest.fn()

            await onInit({
                actionName: BigCommerceActionType.CreateOrder,
                customer,
                integrationId,
                currency,
                setCart: setCartMock,
            })

            expect(setCartMock).toHaveBeenCalledWith(cart)
        })
    })

    describe('onCancel', () => {
        it('should handle pressing cancel button', () => {
            apiMock.onAny().reply(204)

            const setCartMock = jest.fn()

            onCancel({
                actionName: BigCommerceActionType.CreateOrder,
                integrationId,
                via: 'footer',
                cart,
                setCart: setCartMock,
            })

            expect(setCartMock).toHaveBeenCalledWith(null)
        })
    })

    describe('onReset', () => {
        it('should reset all modal state for CreateOrder action', () => {
            const setCartMock = jest.fn()
            const setProductsMock = jest.fn()
            const setCommentMock = jest.fn()
            const setNoteMock = jest.fn()

            onReset({
                actionName: BigCommerceActionType.CreateOrder,
                setCart: setCartMock,
                setProducts: setProductsMock,
                setComment: setCommentMock,
                setNote: setNoteMock,
            })

            expect(setCartMock).toHaveBeenCalledWith(null)
            expect(setProductsMock).toHaveBeenCalledWith(new Map())
            expect(setCommentMock).toHaveBeenCalledWith('')
            expect(setNoteMock).toHaveBeenCalledWith('')
        })

        it('should reset all modal state for DuplicateOrder action', () => {
            const setCartMock = jest.fn()
            const setProductsMock = jest.fn()
            const setCommentMock = jest.fn()
            const setNoteMock = jest.fn()

            onReset({
                actionName: BigCommerceActionType.DuplicateOrder,
                setCart: setCartMock,
                setProducts: setProductsMock,
                setComment: setCommentMock,
                setNote: setNoteMock,
            })

            expect(setCartMock).toHaveBeenCalledWith(null)
            expect(setProductsMock).toHaveBeenCalledWith(new Map())
            expect(setCommentMock).toHaveBeenCalledWith('')
            expect(setNoteMock).toHaveBeenCalledWith('')
        })
    })

    describe('createCart', () => {
        it('should create the cart', async () => {
            apiMock.onAny().reply(200, cartResponse)

            const newCart = await exportedForTesting.createCart({
                actionName: BigCommerceActionType.CreateOrder,
                integrationId,
                customer,
                currency,
            })

            expect(newCart).toStrictEqual(cart)
        })
    })

    describe('addLineItem', () => {
        it('should add a line item to the cart', async () => {
            apiMock.onAny().reply<BigCommerceCartResponse>(200, { cart })

            const setIsLoadingMock = jest.fn()
            const setProductsMock = jest.fn()
            const setCartMock = jest.fn()

            await addLineItem({
                actionName: BigCommerceActionType.CreateOrder,
                integrationId,
                product,
                variant,
                cart,
                products,
                setIsLoading: setIsLoadingMock,
                setCart: setCartMock,
                setProducts: setProductsMock,
                setModalErrors,
            })

            expect(setIsLoadingMock).toHaveBeenCalledTimes(2)
            expect(setProductsMock).toHaveBeenCalled()
            expect(setCartMock).toHaveBeenCalledWith(cart)
        })

        it('should throw product modifiers error', async () => {
            const mockProduct = { ...bigCommerceProductFixture() }

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
                    actionName: BigCommerceActionType.CreateOrder,
                    integrationId,
                    product,
                    variant,
                    cart,
                    products,
                    setIsLoading: setIsLoadingMock,
                    setCart: setCartMock,
                    setProducts: setProductsMock,
                    setModalErrors,
                }),
            ).rejects.toThrow(ProductModifiersChangedError)

            expect(setIsLoadingMock).toHaveBeenCalledTimes(2)
            expect(setProductsMock).not.toHaveBeenCalled()
            expect(setCartMock).not.toHaveBeenCalled()
        })

        it('should set an error because quantity is more than stock', async () => {
            apiMock.onAny().reply<BigCommerceCartResponse>(422, {
                error: {
                    data: { cart },
                    msg: 'Invalid quantity selected. Please adjust product quantity.',
                },
            })

            const setIsLoadingMock = jest.fn()
            const setModalErrorsMock = jest.fn()

            await addLineItem({
                actionName: BigCommerceActionType.CreateOrder,
                integrationId: integrationId,
                product: product,
                variant: variant,
                setIsLoading: setIsLoadingMock,
                cart,
                setCart,
                products,
                setProducts,
                setModalErrors: setModalErrorsMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalledTimes(2)
            expect(setModalErrorsMock).toHaveBeenCalledWith(
                'modal',
                `Invalid quantity selected for <b>${product.name}</b>. Please adjust product quantity.`,
                `${product.id}_${variant?.id}`,
            )
        })
    })

    describe('removeRow', () => {
        it('should remove a row from the cart', async () => {
            apiMock.onAny().reply(200, nestedCartResponse)

            const setIsLoadingMock = jest.fn()
            const setCartMock = jest.fn()
            const setModalErrorsMock = jest.fn()

            await removeRow({
                actionName: BigCommerceActionType.CreateOrder,
                integrationId,
                index,
                cart,
                setIsLoading: setIsLoadingMock,
                setCart: setCartMock,
                setModalErrors: setModalErrorsMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setCartMock).toHaveBeenCalled()
            expect(setModalErrorsMock).toHaveBeenCalled()
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
            setModalErrors,
        }

        it('should update a row from the cart', async () => {
            const cart = bigCommerceCartFixture()

            apiMock.onAny().reply<BigCommerceNestedCartResponse>(200, {
                data: { cart: bigCommerceCartFixture() },
            })

            const setIsLoadingMock = jest.fn()
            const setCartMock = jest.fn()

            await updateRow({
                ...defaultProps,
                setIsLoading: setIsLoadingMock,
                setCart: setCartMock,
                actionName: BigCommerceActionType.CreateOrder,
            })

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setCartMock).toHaveBeenCalledWith(cart)
        })

        it('should set an error because error was thrown', async () => {
            apiMock.onAny().reply(422)

            const setIsLoadingMock = jest.fn()
            const setModalErrorsMock = jest.fn()

            await expect(() =>
                updateRow({
                    ...defaultProps,
                    setIsLoading: setIsLoadingMock,
                    setModalErrors: setModalErrorsMock,
                    actionName: BigCommerceActionType.CreateOrder,
                }),
            ).rejects.toThrow()

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setModalErrorsMock).toHaveBeenCalled()
        })

        it('should set an error because error field was returned', async () => {
            apiMock.onAny().reply<BigCommerceNestedCartResponse>(422, {
                error: {
                    // @ts-ignore
                    data: { cart: {} },
                    msg: 'Invalid quantity selected. Please adjust product quantity.',
                },
            })

            const setIsLoadingMock = jest.fn()
            const setModalErrorsMock = jest.fn()

            await expect(() =>
                updateRow({
                    ...defaultProps,
                    setIsLoading: setIsLoadingMock,
                    setModalErrors: setModalErrorsMock,
                    actionName: BigCommerceActionType.CreateOrder,
                }),
            ).rejects.toThrow(
                new BigCommerceLineItemError(
                    'Invalid quantity selected. Please adjust product quantity.',
                ),
            )

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setModalErrorsMock).toHaveBeenCalled()
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
            setModalErrors,
        }

        it('should update line item modifiers', async () => {
            const cart = bigCommerceCartFixture()

            apiMock.onAny().reply<BigCommerceNestedCartResponse>(200, {
                data: { cart: bigCommerceCartFixture() },
            })

            const setIsLoadingMock = jest.fn()
            const setCartMock = jest.fn()

            await updateLineItemModifiers({
                ...defaultProps,
                setIsLoading: setIsLoadingMock,
                setCart: setCartMock,
                discounts: new Map(),
                setDiscounts: jest.fn(),
            })

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setCartMock).toHaveBeenCalledWith(cart)
        })

        it('should set an error because error field was returned', async () => {
            apiMock.onAny().reply<BigCommerceNestedCartResponse>(422, {
                error: {
                    // @ts-ignore
                    data: { cart: {} },
                    msg: '[BIGCOMMERCE][some_action] BigCommerce API has returned an error: (422): Doing very bad my friend.',
                },
            })

            const setIsLoadingMock = jest.fn()
            const setModalErrorsMock = jest.fn()

            await expect(() =>
                updateLineItemModifiers({
                    ...defaultProps,
                    setIsLoading: setIsLoadingMock,
                    setModalErrors: setModalErrorsMock,
                    discounts: new Map(),
                    setDiscounts: jest.fn(),
                }),
            ).rejects.toThrow(
                new BigCommerceLineItemError('Product could not be updated.'),
            )

            expect(setIsLoadingMock).toHaveBeenCalled()
            expect(setIsLoadingMock).toHaveBeenCalled()
        })
    })
})
