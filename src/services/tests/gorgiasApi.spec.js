import querystring from 'querystring'
import url from 'url'

import MockAdapter from 'axios-mock-adapter'
import axios from 'axios/index'

import {fromJS} from 'immutable'

import GorgiasApi from '../gorgiasApi'
import type {AuditLogEvent} from '../../models/event'
import {TICKET_REOPENED} from '../../constants/event'
import type {IntegrationDataItem} from '../../models/integration'
import {
    INTEGRATION_DATA_ITEM_TYPE_PRODUCT,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../constants/integration'
import {
    shopifyCancelOrderPayloadFixture,
    shopifyInvoicePayloadFixture,
} from '../../fixtures/shopify'
import {ViewVisibility} from '../../constants/view'

describe('services', () => {
    describe('GorgiasApi', () => {
        let apiMock = null

        beforeEach(() => {
            apiMock = new MockAdapter(axios)
        })

        afterAll(() => {
            apiMock.restore()
        })

        describe('cancelPendingRequests()', () => {
            it('should not be able to cancel pending requests because instance was not created with this ability', () => {
                const gorgiasApi = new GorgiasApi({requestsCancellation: false})
                let errorCaught = null

                try {
                    gorgiasApi.cancelPendingRequests()
                } catch (error) {
                    errorCaught = error
                }
                expect(errorCaught.message).toMatchSnapshot()
            })

            it('should cancel pending requests', async () => {
                apiMock = new MockAdapter(axios, {delayResponse: 2000})
                apiMock.onAny().reply(200, {})

                const gorgiasApi = new GorgiasApi({requestsCancellation: true})
                let errorCaught = null

                setTimeout(() => {
                    gorgiasApi.cancelPendingRequests()
                }, 1)

                try {
                    await gorgiasApi.getStatistic('overview', fromJS({}))
                } catch (error) {
                    errorCaught = error
                }
                expect(axios.isCancel(errorCaught)).toEqual(true)
            })

            it('should cancel pending requests and refresh token', async () => {
                const expectedData = {foo: 'bar'}

                apiMock = new MockAdapter(axios, {delayResponse: 500})
                apiMock
                    .onPost()
                    .reply(200, {})
                    .onPost()
                    .reply(200, expectedData)

                const gorgiasApi = new GorgiasApi({requestsCancellation: true})
                let errorCaught = null

                setTimeout(() => {
                    gorgiasApi.cancelPendingRequests(true)
                }, 1)

                try {
                    await gorgiasApi.getStatistic('overview', fromJS({}))
                } catch (error) {
                    errorCaught = error
                }
                expect(axios.isCancel(errorCaught)).toEqual(true)

                const data = await gorgiasApi.getStatistic(
                    'overview',
                    fromJS({})
                )
                expect(data).toEqual(fromJS(expectedData))
            })
        })

        describe('*paginate()', () => {
            it('should yield each page of requested items until last page is reached', async () => {
                const mocks = [
                    {data: [1, 2, 3], meta: {next_page: '/foo/bar?page=2'}},
                    {data: [4, 5, 6], meta: {next_page: '/foo/bar?page=3'}},
                    {data: [7, 8, 9], meta: {}},
                ]

                const path = '/foo/bar'
                const matcher = new RegExp(`${path}/*`)

                apiMock.onGet(matcher).reply((config) => {
                    const parsedUrl = url.parse(config.url)
                    const parsedQuery = querystring.parse(parsedUrl.query || '')
                    const page =
                        parsedQuery && parsedQuery.page
                            ? parseInt(parsedQuery.page)
                            : 1
                    const index = page - 1
                    return [200, mocks[index]]
                })

                const gorgiasApi = new GorgiasApi()
                const pages = []

                for await (const events of gorgiasApi.paginate(path)) {
                    pages.push(events)
                }

                expect(pages.length).toBe(mocks.length)
                pages.forEach((page, index) => {
                    expect(page).toEqual(mocks[index].data)
                })
            })
        })

        describe('getStatistic()', () => {
            it('should fetch a statistic with the given name and filters', async () => {
                const expectedStat = {data: {}, meta: {}}
                apiMock.onAny().reply(200, expectedStat)

                const data = fromJS({
                    filters: {
                        tags: [1, 2],
                        score: '4',
                    },
                })

                const stat = await new GorgiasApi().getStatistic(
                    'overview',
                    data
                )
                expect(stat.toJS()).toEqual(expectedStat)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('downloadStatistic()', () => {
            it('should fetch a statistic with the given name and filters (ready to be downloaded)', async () => {
                const expectedStat = {data: {}, meta: {}}
                const respHeaders = {
                    'content-disposition':
                        'attachment; filename=support-volume-2019-05-23-2019-05-29.csv',
                    'content-type': 'text/csv',
                }
                apiMock.onAny().reply(200, expectedStat, respHeaders)

                const data = fromJS({
                    filters: {
                        tags: [1, 2],
                        score: '4',
                    },
                })
                const stat = await new GorgiasApi().downloadStatistic(
                    'overview',
                    data
                )
                expect(stat).toMatchSnapshot()
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('startSubscription()', () => {
            it('should start the subscription of the current account.', async () => {
                const expectedSubscription = {
                    plan: 'basic-usd-1',
                    status: 'active',
                }
                apiMock.onAny().reply(201, expectedSubscription)

                const subscription = await new GorgiasApi().startSubscription()
                expect(subscription.toJS()).toEqual(expectedSubscription)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('updateCreditCard()', () => {
            it('should update the credit card of the current account.', async () => {
                const expectedCard = {
                    last4: '2131',
                    name: 'Steve Frizeli',
                    brand: 'visa',
                    exp_month: '12',
                    exp_year: '23',
                }
                apiMock.onAny().reply(202, expectedCard)
                const stripeCardToken = 'tok_2xe129dnm21d2miwmdfsa'
                const card = await new GorgiasApi().updateCreditCard(
                    fromJS({token: stripeCardToken})
                )
                expect(card.toJS()).toEqual(expectedCard)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('payInvoice()', () => {
            it('should make an HTTP request to pay an invoice.', async () => {
                const expectedInvoice = {
                    id: 'in_1dj2801j2d',
                    paid: true,
                    amout_due: 35312,
                }
                apiMock.onAny().reply(202, expectedInvoice)
                const invoice = await new GorgiasApi().payInvoice(
                    expectedInvoice['id']
                )
                expect(invoice.toJS()).toEqual(expectedInvoice)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('confirmInvoicePayment()', () => {
            it('should make an HTTP request to confirm a payment for an invoice.', async () => {
                const expectedInvoice = {
                    id: 'in_mf9u2x3j20z',
                    paid: true,
                    amout_due: 43521,
                }
                apiMock.onAny().reply(202, expectedInvoice)
                const invoice = await new GorgiasApi().confirmInvoicePayment(
                    expectedInvoice['id']
                )
                expect(invoice.toJS()).toEqual(expectedInvoice)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('*getTicketEvents()', function () {
            const getEvent = (id: number): AuditLogEvent => ({
                id,
                account_id: 1,
                user_id: 1,
                object_type: 'Ticket',
                object_id: 1,
                data: null,
                context: 'foo',
                type: TICKET_REOPENED,
                created_datetime: '2019-11-15 19:00:00.000000',
            })

            it('should yield each page of events until last page is reached', async () => {
                const gorgiasApi = new GorgiasApi()
                const ticketId = 123
                const expectedUrl = `/api/tickets/${ticketId}/events/`
                const mocks = [
                    [getEvent(1), getEvent(2), getEvent(3)],
                    [getEvent(4), getEvent(5), getEvent(6)],
                    [getEvent(7), getEvent(8), getEvent(9)],
                ]

                gorgiasApi.paginate = function* (url) {
                    expect(url).toBe(expectedUrl)

                    for (const mock of mocks) {
                        yield mock
                    }
                }

                const pages = []

                for await (const events of gorgiasApi.getTicketEvents(
                    ticketId
                )) {
                    pages.push(events)
                }

                expect(pages.length).toBe(mocks.length)
                pages.forEach((page, index) => {
                    expect(page).toEqual(fromJS(mocks[index]))
                })
            })
        })

        describe('search()', () => {
            it('should return search results for given filter', async () => {
                const endpoint = '/foo'
                const filter = 'abc'
                const data = [{id: 1}, {id: 2}, {id: 3}]

                apiMock.onGet(endpoint).reply(200, {data})

                const gorgiasApi = new GorgiasApi()
                const searchResults = await gorgiasApi.search(endpoint, filter)

                expect(searchResults).toEqual(data)
            })
        })

        describe('*getIntegrationDataItems()', function () {
            const getItem = (id: number): IntegrationDataItem<null> => ({
                id,
                integration_id: 1,
                integration_type: SHOPIFY_INTEGRATION_TYPE,
                external_id: id.toString(),
                item_type: INTEGRATION_DATA_ITEM_TYPE_PRODUCT,
                search: 'foo',
                data: null,
                created_datetime: '2020-02-19 18:30:00.000000',
                updated_datetime: '2020-02-19 18:30:00.000000',
                deleted_datetime: null,
            })

            it('should yield each page of events until last page is reached', async () => {
                const gorgiasApi = new GorgiasApi()
                const integrationId = 123
                const integrationDataItemType = INTEGRATION_DATA_ITEM_TYPE_PRODUCT
                const expectedUrl = `/api/integrations/${integrationId}/${integrationDataItemType}`
                const mocks = [
                    [getItem(1), getItem(2), getItem(3)],
                    [getItem(4), getItem(5), getItem(6)],
                    [getItem(7), getItem(8), getItem(9)],
                ]

                gorgiasApi.paginate = function* (url) {
                    expect(url).toBe(expectedUrl)

                    for (const mock of mocks) {
                        yield mock
                    }
                }

                const pages = []
                const generator = gorgiasApi.getIntegrationDataItems(
                    integrationId,
                    integrationDataItemType,
                    []
                )

                for await (const events of generator) {
                    pages.push(events)
                }

                expect(pages.length).toBe(mocks.length)
                pages.forEach((page, index) => {
                    expect(page).toEqual(fromJS(mocks[index]))
                })
            })
        })

        describe('createDraftOrder()', () => {
            it('should create a draft order and return its values', async () => {
                const data = {draft_order: {id: 123}}
                apiMock
                    .onPost('/integrations/shopify/order/draft/')
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const orderId = 2
                const payload = fromJS({line_items: []})
                const draftOrder = await gorgiasApi.createDraftOrder(
                    integrationId,
                    payload,
                    orderId
                )

                expect(draftOrder).toEqual([fromJS(data.draft_order), null])
            })

            it('should create a draft order and return its values with a polling config', async () => {
                const data = {
                    draft_order: {id: 123},
                    location: '/foo',
                    retry_after: '3',
                }
                apiMock
                    .onPost('/integrations/shopify/order/draft/')
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const orderId = 2
                const payload = fromJS({line_items: []})
                const draftOrder = await gorgiasApi.createDraftOrder(
                    integrationId,
                    payload,
                    orderId
                )

                expect(draftOrder).toEqual([
                    fromJS(data.draft_order),
                    {location: '/foo', retry_after: 3},
                ])
            })
        })

        describe('updateDraftOrder()', () => {
            it('should update a draft order and return its values', async () => {
                const draftOrderId = 2
                const data = {draft_order: {id: 123}}
                apiMock
                    .onPut(`/integrations/shopify/order/draft/${draftOrderId}/`)
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const payload = fromJS({line_items: []})
                const draftOrder = await gorgiasApi.upsertDraftOrder(
                    integrationId,
                    payload,
                    draftOrderId
                )

                expect(draftOrder).toEqual([fromJS(data.draft_order), null])
            })

            it('should update a draft order and return its values with a polling config', async () => {
                const draftOrderId = 2
                const data = {
                    draft_order: {id: 123},
                    location: '/foo',
                    retry_after: '3',
                }
                apiMock
                    .onPut(`/integrations/shopify/order/draft/${draftOrderId}/`)
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const payload = fromJS({line_items: []})
                const draftOrder = await gorgiasApi.upsertDraftOrder(
                    integrationId,
                    payload,
                    draftOrderId
                )

                expect(draftOrder).toEqual([
                    fromJS(data.draft_order),
                    {location: '/foo', retry_after: 3},
                ])
            })
        })

        describe('getDraftOrder()', () => {
            it('should fetch a draft order and return its values', async () => {
                const draftOrderId = 2
                const data = {draft_order: {id: 123}}
                apiMock
                    .onGet(`/integrations/shopify/order/draft/${draftOrderId}/`)
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const draftOrder = await gorgiasApi.getDraftOrder(
                    integrationId,
                    draftOrderId
                )

                expect(draftOrder).toEqual([fromJS(data.draft_order), null])
            })

            it('should fetch a draft order and return its values with a polling config', async () => {
                const draftOrderId = 2
                const data = {
                    draft_order: {id: 123},
                    location: '/foo',
                    retry_after: '3',
                }
                apiMock
                    .onGet(`/integrations/shopify/order/draft/${draftOrderId}/`)
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const draftOrder = await gorgiasApi.getDraftOrder(
                    integrationId,
                    draftOrderId
                )

                expect(draftOrder).toEqual([
                    fromJS(data.draft_order),
                    {location: '/foo', retry_after: 3},
                ])
            })
        })

        describe('deleteDraftOrder()', () => {
            it('should delete a draft order', async () => {
                const draftOrderId = 2
                apiMock
                    .onDelete(
                        `/integrations/shopify/order/draft/${draftOrderId}/`
                    )
                    .reply(204)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                await gorgiasApi.deleteDraftOrder(integrationId, draftOrderId)

                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('emailDraftOrderInvoice()', () => {
            it('should email invoice of given draft order', async () => {
                const draftOrderId = 2
                apiMock
                    .onPost(
                        `/integrations/shopify/order/draft/${draftOrderId}/send-invoice/`
                    )
                    .reply(200)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const invoicePayload = fromJS(shopifyInvoicePayloadFixture())
                await gorgiasApi.emailDraftOrderInvoice(
                    integrationId,
                    draftOrderId,
                    invoicePayload
                )

                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('calculateRefund()', () => {
            it('should calculate refund for given draft order', async () => {
                const orderId = 2
                const expectedRefund = {foo: 'bar'}
                const data = {refund: expectedRefund}
                apiMock
                    .onPost(
                        `/integrations/shopify/order/${orderId}/refunds/calculate/`
                    )
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const payload = fromJS(shopifyCancelOrderPayloadFixture())
                const refund = await gorgiasApi.calculateRefund(
                    integrationId,
                    orderId,
                    payload
                )

                expect(refund).toEqual(fromJS(expectedRefund))
            })
        })

        describe('getViewSharing()', () => {
            it("should fetch view's sharing options", async () => {
                const viewId = 1
                const expectedData = {
                    id: viewId,
                    visibility: ViewVisibility.PUBLIC,
                    shared_with_teams: [],
                    shared_with_users: [],
                }

                apiMock.onGet(`/api/views/${viewId}`).reply(200, expectedData)

                const gorgiasApi = new GorgiasApi()
                const result = await gorgiasApi.getViewSharing(viewId)

                expect(result).toEqual(fromJS(expectedData))
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('setViewSharing()', () => {
            it("should update view's sharing options", async () => {
                const viewId = 1
                const visibility = ViewVisibility.PUBLIC
                const teams = fromJS([{id: 2}])
                const users = fromJS([{id: 3}])

                apiMock.onPut(`/api/views/${viewId}`).reply(202)

                const gorgiasApi = new GorgiasApi()
                await gorgiasApi.setViewSharing(
                    viewId,
                    visibility,
                    teams,
                    users
                )

                expect(apiMock.history).toMatchSnapshot()
            })
        })
    })
})
