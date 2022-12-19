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
    onCancel,
    onInit,
    // onReset,
    exportedForTesting,
    addRow,
    removeRow,
    updateRow,
} from '../utils'

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
    const index = 0
    const newQuantity = 2
    const products = new Map<number, BigCommerceProduct>()
    products.set(product.id, product)

    const setCart = jest.fn()
    const setIsLoading = jest.fn()
    const setProducts = jest.fn()
    const setQuantity = jest.fn()
    const setLineItemWithErrorId = jest.fn()

    describe('onInit', () => {
        it('should init the order modal', async () => {
            apiMock.onAny().reply(200, cart)

            await onInit({customer, integrationId, setIsLoading, setCart})

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
            })
            expect(newCart).toStrictEqual(cart)
        })
    })

    describe('addRow', () => {
        it('should add a row to the cart', async () => {
            apiMock.onAny().reply(200, cart)

            await addRow({
                integrationId,
                product,
                variant,
                setIsLoading,
                cart,
                setCart,
                products,
                setProducts,
                setLineItemWithErrorId,
            })

            expect(setIsLoading).toHaveBeenCalled()
            expect(setProducts).toHaveBeenCalled()
            expect(setCart).toHaveBeenCalled()
        })

        it('should set an error because quantity is more than stock', async () => {
            apiMock.onAny().reply(422, cart)

            await addRow({
                integrationId,
                product,
                variant,
                setIsLoading,
                cart,
                setCart,
                products,
                setProducts,
                setLineItemWithErrorId,
            })

            expect(setIsLoading).toHaveBeenCalled()
            expect(setLineItemWithErrorId).toHaveBeenCalled()
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
                setLineItemWithErrorId,
            })

            expect(setIsLoading).toHaveBeenCalled()
            expect(setCart).toHaveBeenCalled()
            expect(setLineItemWithErrorId).toHaveBeenCalledWith('')
        })
    })

    describe('updateRow', () => {
        it('should update a row from the cart', async () => {
            apiMock.onAny().reply(200, nestedResponse)
            await updateRow({
                integrationId,
                index,
                newQuantity,
                setIsLoading,
                cart,
                setCart,
                setQuantity,
                setLineItemWithErrorId,
            })

            expect(setIsLoading).toHaveBeenCalled()
            expect(setCart).toHaveBeenCalled()
        })

        it('should set an error because quantity is more than stock', async () => {
            apiMock.onAny().reply(422, nestedResponse)
            await updateRow({
                integrationId,
                index,
                newQuantity,
                setIsLoading,
                cart,
                setCart,
                setQuantity,
                setLineItemWithErrorId,
            })

            expect(setIsLoading).toHaveBeenCalled()
            expect(setLineItemWithErrorId).toHaveBeenCalled()
        })
    })
})
