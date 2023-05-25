import MockAdapter from 'axios-mock-adapter'
import client from 'models/api/resources'
import {getBigCommerceOrderRefundData} from 'models/integration/resources/bigcommerce'
import {
    bigCommerceCalculateOrderRefundDataResponseFixture,
    bigCommerceCustomerFixture,
} from 'fixtures/bigcommerce'
import {
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
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
        data: bigCommerceCalculateOrderRefundDataResponseFixture,
    }

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
                bigCommerceCalculateOrderRefundDataResponseFixture
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
})
