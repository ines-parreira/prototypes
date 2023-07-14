import MockAdapter from 'axios-mock-adapter'
import client from 'models/api/resources'
import {
    getBigCommerceAvailablePaymentOptionsData,
    getBigCommerceOrderRefundData,
} from 'models/integration/resources/bigcommerce'
import {
    bigCommerceAvailablePaymentOptionsDataResponseFixture,
    bigCommerceCalculateOrderRefundDataResponseApiFixture,
    bigCommerceCustomerFixture,
} from 'fixtures/bigcommerce'
import {
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
    BigCommerceRefundableItemType,
} from 'models/integration/types'

const mockedServer = new MockAdapter(client)

describe('bigcommerce integration resource', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    const integrationId = 1
    const customer = bigCommerceCustomerFixture()
    const orderId = 121
    const nestedCalculateOrderRefundDataResponse = {
        data: bigCommerceCalculateOrderRefundDataResponseApiFixture,
    }

    const bigCommerceAvailablePaymentOptionsDataResponse =
        bigCommerceAvailablePaymentOptionsDataResponseFixture

    describe('getBigCommerceOrderRefundData', () => {
        it('should return BigCommerce refund data for an order', async () => {
            mockedServer
                .onAny()
                .reply(200, nestedCalculateOrderRefundDataResponse)

            await expect(
                getBigCommerceOrderRefundData({
                    integrationId,
                    customerId: customer.id,
                    orderId,
                })
            ).resolves.toEqual(
                bigCommerceCalculateOrderRefundDataResponseApiFixture
            )
        })

        it('should throw a default BigCommerce error', async () => {
            mockedServer.onAny().reply(400, {
                error: {
                    data: {},
                    msg: 'Bad request',
                },
            })

            await expect(
                getBigCommerceOrderRefundData({
                    integrationId,
                    customerId: customer.id,
                    orderId,
                })
            ).rejects.toThrow(
                new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            )
        })

        it('should throw a `too many requests` BigCommerce error', async () => {
            mockedServer.onAny().reply(429, {
                error: {
                    data: {},
                    msg: 'Too many requests',
                },
            })

            await expect(
                getBigCommerceOrderRefundData({
                    integrationId,
                    customerId: customer.id,
                    orderId,
                })
            ).rejects.toThrow(
                new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            )
        })
    })

    describe('getBigCommerceAvailablePaymentOptionsData', () => {
        it('should return BigCommerce refund methods data for an order', async () => {
            mockedServer
                .onAny()
                .reply(200, bigCommerceAvailablePaymentOptionsDataResponse)

            await expect(
                getBigCommerceAvailablePaymentOptionsData({
                    integrationId,
                    customerId: customer.id,
                    orderId,
                    payload: {
                        items: [
                            {
                                item_type: BigCommerceRefundableItemType.order,
                                item_id: orderId,
                                amount: 222.33,
                            },
                        ],
                    },
                })
            ).resolves.toEqual(bigCommerceAvailablePaymentOptionsDataResponse)
        })

        it('should throw a default BigCommerce error', async () => {
            mockedServer.onAny().reply(400, {
                error: {
                    data: {},
                    msg: 'Bad request',
                },
            })

            await expect(
                getBigCommerceAvailablePaymentOptionsData({
                    integrationId,
                    customerId: customer.id,
                    orderId,
                    payload: {
                        items: [],
                    },
                })
            ).rejects.toThrow(
                new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultError
                )
            )
        })

        it('should throw a `too many requests` BigCommerce error', async () => {
            mockedServer.onAny().reply(429, {
                error: {
                    data: {},
                    msg: 'Too many requests',
                },
            })

            await expect(
                getBigCommerceAvailablePaymentOptionsData({
                    integrationId,
                    customerId: customer.id,
                    orderId,
                    payload: {
                        items: [],
                    },
                })
            ).rejects.toThrow(
                new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.rateLimitingError
                )
            )
        })

        it('should throw a default refund BigCommerce order error', async () => {
            mockedServer.onAny().reply(422, {
                error: {
                    data: {},
                    msg: `[BIGCOMMERCE][create_refund_quote] BigCommerce API has returned an error: (422): Order with ID ${orderId} can not be refunded.`,
                },
            })

            await expect(
                getBigCommerceAvailablePaymentOptionsData({
                    integrationId,
                    customerId: customer.id,
                    orderId,
                    payload: {
                        items: [],
                    },
                })
            ).rejects.toThrow(
                new BigCommerceGeneralError(
                    BigCommerceGeneralErrorMessage.defaultRefundError
                )
            )
        })
    })
})
