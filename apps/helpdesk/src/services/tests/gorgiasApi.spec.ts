import { isCancel } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import type { List } from 'immutable'
import { fromJS } from 'immutable'
import querystring from 'querystring'
import url from 'url'

import { basicMonthlyHelpdeskPlan, HELPDESK_PRODUCT_ID } from 'fixtures/plans'
import {
    shopifyCancelOrderPayloadFixture,
    shopifyInvoicePayloadFixture,
} from 'fixtures/shopify'
import client from 'models/api/resources'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import type { Event } from 'models/event/types'
import {
    EventObjectType,
    SATISFACTION_SURVEY_EVENT_TYPES,
    TICKET_EVENT_TYPES,
} from 'models/event/types'
import type { IntegrationDataItem } from 'models/integration/types'
import {
    IntegrationDataItemType,
    IntegrationType,
} from 'models/integration/types'
import { ViewVisibility } from 'models/view/types'
import GorgiasApi from 'services/gorgiasApi'

describe('services', () => {
    describe('GorgiasApi', () => {
        let apiMock: MockAdapter

        beforeEach(() => {
            apiMock = new MockAdapter(client)
        })

        afterAll(() => {
            apiMock.restore()
        })

        describe('cancelPendingRequests()', () => {
            it('should not be able to cancel pending requests because instance was not created with this ability', () => {
                const gorgiasApi = new GorgiasApi({
                    requestsCancellation: false,
                })
                let errorCaught: Error | null = null

                try {
                    gorgiasApi.cancelPendingRequests()
                } catch (error) {
                    errorCaught = error as Error
                }
                expect(errorCaught?.message).toMatchSnapshot()
            })

            it('should cancel pending requests', async () => {
                apiMock = new MockAdapter(client, { delayResponse: 2000 })
                apiMock.onAny().reply(200, {})

                const gorgiasApi = new GorgiasApi({
                    requestsCancellation: true,
                })
                let errorCaught = null

                setTimeout(() => {
                    gorgiasApi.cancelPendingRequests()
                }, 1)

                try {
                    await gorgiasApi.payInvoice('123')
                } catch (error) {
                    errorCaught = error
                }
                expect(isCancel(errorCaught)).toEqual(true)
            })

            it('should cancel pending requests and refresh token', async () => {
                const expectedData = { foo: 'bar' }

                apiMock = new MockAdapter(client, { delayResponse: 500 })
                apiMock.onPut().reply(200, {}).onPut().reply(200, expectedData)

                const gorgiasApi = new GorgiasApi({
                    requestsCancellation: true,
                })
                let errorCaught = null

                setTimeout(() => {
                    gorgiasApi.cancelPendingRequests(true)
                }, 1)

                try {
                    await gorgiasApi.payInvoice('123')
                } catch (error) {
                    errorCaught = error
                }
                expect(isCancel(errorCaught)).toEqual(true)

                const data = await gorgiasApi.payInvoice('123')
                expect(data).toEqual(fromJS(expectedData))
            })
        })

        describe('*paginate()', () => {
            it('should yield each page of requested items until last page is reached', async () => {
                const mocks = [
                    { data: [1, 2, 3], meta: { next_page: '/foo/bar?page=2' } },
                    { data: [4, 5, 6], meta: { next_page: '/foo/bar?page=3' } },
                    { data: [7, 8, 9], meta: {} },
                ]

                const path = '/foo/bar'
                const matcher = new RegExp(`${path}/*`)

                apiMock.onGet(matcher).reply((config) => {
                    const parsedUrl = url.parse(config.url || '')
                    const parsedQuery = querystring.parse(parsedUrl.query || '')
                    const page =
                        parsedQuery && parsedQuery.page
                            ? parseInt(parsedQuery.page as string)
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

        describe('*cursorPaginate()', () => {
            it('should yield each page of requested items until last page is reached', async () => {
                const mocks: ApiListResponseCursorPagination<any[]>[] = [
                    {
                        data: [1, 2, 3],
                        meta: {
                            next_cursor: 'cursored_page_2',
                            prev_cursor: null,
                            total_resources: null,
                        },
                        object: 'list',
                        uri: 'api/events',
                    },
                    {
                        data: [4, 5, 6],
                        meta: {
                            next_cursor: 'cursored_page_3',
                            prev_cursor: 'cursored_page_1',
                            total_resources: null,
                        },
                        object: 'list',
                        uri: 'api/events',
                    },
                    {
                        data: [7, 8, 9],
                        meta: {
                            next_cursor: null,
                            prev_cursor: 'cursored_page_2',
                            total_resources: null,
                        },
                        object: 'list',
                        uri: 'api/events',
                    },
                ]

                const path = '/foo/bar'
                const matcher = new RegExp(`${path}/*`)

                apiMock
                    .onGet(matcher)
                    .replyOnce(200, mocks[0])
                    .onGet(matcher)
                    .replyOnce(200, mocks[1])
                    .onGet(matcher)
                    .replyOnce(200, mocks[2])

                const gorgiasApi = new GorgiasApi()
                const pages = []

                const asyncFunction = (params?: { cursor?: string | null }) =>
                    gorgiasApi._api.get('/foo/bar', { params })

                for await (const events of gorgiasApi.cursorPaginate(
                    asyncFunction,
                )) {
                    pages.push(events)
                }

                expect(pages.length).toBe(mocks.length)
                pages.forEach((page, index) => {
                    expect(page).toEqual(mocks[index].data)
                })
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('startSubscription()', () => {
            it('should start the subscription of the current account.', async () => {
                const expectedSubscription = {
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    },
                    status: 'active',
                }
                apiMock.onAny().reply(201, expectedSubscription)

                const subscription = await new GorgiasApi().startSubscription()
                expect(subscription.toJS()).toEqual(expectedSubscription)
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
                    expectedInvoice['id'],
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
                    expectedInvoice['id'],
                )
                expect(invoice.toJS()).toEqual(expectedInvoice)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('*getTicketEvents()', function () {
            const getEvent = (id: number): Event => ({
                id,
                user_id: 1,
                object_type: EventObjectType.Ticket,
                object_id: 1,
                data: null,
                context: 'foo',
                type: TICKET_EVENT_TYPES.TicketReopened,
                created_datetime: '2019-11-15 19:00:00.000000',
                uri: '/api/events/3265847/',
            })

            it('should yield each page of events until last page is reached', async () => {
                const gorgiasApi = new GorgiasApi()
                const ticketId = 123
                const mocks = [
                    [getEvent(1), getEvent(2), getEvent(3)],
                    [getEvent(4), getEvent(5), getEvent(6)],
                    [getEvent(7), getEvent(8), getEvent(9)],
                ]

                gorgiasApi.cursorPaginate = function* () {
                    for (const mock of mocks) {
                        yield mock
                    }
                } as any

                const pages = []

                // @ts-ignore ts(2763)
                for await (const events of gorgiasApi.getTicketEvents(
                    ticketId,
                )) {
                    pages.push(events)
                }

                expect(pages.length).toBe(mocks.length)
                pages.forEach((page, index) => {
                    expect(page).toEqual(fromJS(mocks[index]))
                })
            })
        })

        describe('*getSatisfactionSurveyEvents()', function () {
            const getEvent = (id: number): Event => ({
                id,
                user_id: 1,
                object_type: EventObjectType.SatisfactionSurvey,
                object_id: 1,
                data: null,
                context: '7d87ac05-8689-43ee-9cdd-b2928fd3ca6f',
                type: SATISFACTION_SURVEY_EVENT_TYPES.SatisfactionSurveyResponded,
                created_datetime: '2019-11-15 19:00:00.000000',
                uri: '/api/events/3265847/',
            })

            it('should yield each page of events until last page is reached', async () => {
                const gorgiasApi = new GorgiasApi()
                const surveyId = 123
                const mocks = [
                    [getEvent(1), getEvent(2), getEvent(3)],
                    [getEvent(4), getEvent(5), getEvent(6)],
                    [getEvent(7), getEvent(8), getEvent(9)],
                ]

                gorgiasApi.cursorPaginate = function* () {
                    for (const mock of mocks) {
                        yield mock
                    }
                } as any

                const pages = []

                // @ts-ignore ts(2763)
                for await (const events of gorgiasApi.getSatisfactionSurveyEvents(
                    surveyId,
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
                const data = [{ id: 1 }, { id: 2 }, { id: 3 }]

                apiMock.onGet(endpoint).reply(200, { data })

                const gorgiasApi = new GorgiasApi()
                const searchResults = await gorgiasApi.search(endpoint, filter)

                expect(searchResults).toEqual(data)
            })
        })

        describe('*getIntegrationDataItems()', function () {
            const getItem = (id: number): IntegrationDataItem<null> => ({
                id,
                integration_id: 1,
                integration_type: IntegrationType.Shopify,
                external_id: id.toString(),
                item_type:
                    IntegrationDataItemType.IntegrationDataItemTypeProduct,
                search: 'foo',
                data: null,
                created_datetime: '2020-02-19 18:30:00.000000',
                updated_datetime: '2020-02-19 18:30:00.000000',
                deleted_datetime: null,
            })

            it('should yield each page of events until last page is reached', async () => {
                const gorgiasApi = new GorgiasApi()
                const integrationId = 123
                const integrationDataItemType =
                    IntegrationDataItemType.IntegrationDataItemTypeProduct
                const expectedUrl = `/api/integrations/${integrationId}/${integrationDataItemType}`
                const mocks = [
                    [getItem(1), getItem(2), getItem(3)],
                    [getItem(4), getItem(5), getItem(6)],
                    [getItem(7), getItem(8), getItem(9)],
                ]

                gorgiasApi.paginate = function* (url: string) {
                    expect(url).toBe(expectedUrl)

                    for (const mock of mocks) {
                        yield mock
                    }
                } as any

                const pages = []
                const generator = gorgiasApi.getIntegrationDataItems(
                    integrationId,
                    integrationDataItemType,
                    [],
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
                const data = { draft_order: { id: 123 } }
                apiMock
                    .onPost('/integrations/shopify/order/draft/')
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const orderId = 2
                const payload = fromJS({ line_items: [] })
                const draftOrder = await gorgiasApi.createDraftOrder(
                    integrationId,
                    payload,
                    orderId,
                )

                expect(draftOrder).toEqual([fromJS(data.draft_order), null])
            })

            it('should create a draft order and return its values with a polling config', async () => {
                const data = {
                    draft_order: { id: 123 },
                    location: '/foo',
                    retry_after: '3',
                }
                apiMock
                    .onPost('/integrations/shopify/order/draft/')
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const orderId = 2
                const payload = fromJS({ line_items: [] })
                const draftOrder = await gorgiasApi.createDraftOrder(
                    integrationId,
                    payload,
                    orderId,
                )

                expect(draftOrder).toEqual([
                    fromJS(data.draft_order),
                    { location: '/foo', retry_after: 3 },
                ])
            })
        })

        describe('updateDraftOrder()', () => {
            it('should update a draft order and return its values', async () => {
                const draftOrderId = 2
                const data = { draft_order: { id: 123 } }
                apiMock
                    .onPut(`/integrations/shopify/order/draft/${draftOrderId}/`)
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const payload = fromJS({ line_items: [] })
                const draftOrder = await gorgiasApi.upsertDraftOrder(
                    integrationId,
                    payload,
                    draftOrderId,
                )

                expect(draftOrder).toEqual([fromJS(data.draft_order), null])
            })

            it('should update a draft order and return its values with a polling config', async () => {
                const draftOrderId = 2
                const data = {
                    draft_order: { id: 123 },
                    location: '/foo',
                    retry_after: '3',
                }
                apiMock
                    .onPut(`/integrations/shopify/order/draft/${draftOrderId}/`)
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const payload = fromJS({ line_items: [] })
                const draftOrder = await gorgiasApi.upsertDraftOrder(
                    integrationId,
                    payload,
                    draftOrderId,
                )

                expect(draftOrder).toEqual([
                    fromJS(data.draft_order),
                    { location: '/foo', retry_after: 3 },
                ])
            })
        })

        describe('getDraftOrder()', () => {
            it('should fetch a draft order and return its values', async () => {
                const draftOrderId = 2
                const data = { draft_order: { id: 123 } }
                apiMock
                    .onGet(`/integrations/shopify/order/draft/${draftOrderId}/`)
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const draftOrder = await gorgiasApi.getDraftOrder(
                    integrationId,
                    draftOrderId,
                )

                expect(draftOrder).toEqual([fromJS(data.draft_order), null])
            })

            it('should fetch a draft order and return its values with a polling config', async () => {
                const draftOrderId = 2
                const data = {
                    draft_order: { id: 123 },
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
                    draftOrderId,
                )

                expect(draftOrder).toEqual([
                    fromJS(data.draft_order),
                    { location: '/foo', retry_after: 3 },
                ])
            })
        })

        describe('deleteDraftOrder()', () => {
            it('should delete a draft order', async () => {
                const draftOrderId = 2
                apiMock
                    .onDelete(
                        `/integrations/shopify/order/draft/${draftOrderId}/`,
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
                        `/integrations/shopify/order/draft/${draftOrderId}/send-invoice/`,
                    )
                    .reply(200)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const invoicePayload = fromJS(shopifyInvoicePayloadFixture())
                await gorgiasApi.emailDraftOrderInvoice(
                    integrationId,
                    draftOrderId,
                    invoicePayload,
                )

                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('calculateRefund()', () => {
            it('should calculate refund for given draft order', async () => {
                const orderId = 2
                const expectedRefund = { foo: 'bar' }
                const data = { refund: expectedRefund }
                apiMock
                    .onPost(
                        `/integrations/shopify/order/${orderId}/refunds/calculate/`,
                    )
                    .reply(200, data)

                const gorgiasApi = new GorgiasApi()
                const integrationId = 1
                const payload = fromJS(shopifyCancelOrderPayloadFixture())
                const refund = await gorgiasApi.calculateRefund(
                    integrationId,
                    orderId,
                    payload,
                )

                expect(refund).toEqual(fromJS(expectedRefund))
            })
        })

        describe('getViewSharing()', () => {
            it("should fetch view's sharing options", async () => {
                const viewId = 1
                const expectedData = {
                    id: viewId,
                    visibility: ViewVisibility.Public,
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
                const visibility = ViewVisibility.Public
                const teams = fromJS([{ id: 2 }]) as List<any>
                const users = fromJS([{ id: 3 }]) as List<any>
                const expectedResult = {
                    visibility,
                    shared_with_teams: teams.toJS(),
                    shared_with_users: users.toJS(),
                }

                apiMock.onPut(`/api/views/${viewId}`).reply(202, expectedResult)

                const gorgiasApi = new GorgiasApi()
                const result = await gorgiasApi.setViewSharing(
                    viewId,
                    visibility,
                    teams,
                    users,
                )

                expect(result).toEqual(expectedResult)
                expect(apiMock.history).toMatchSnapshot()
            })
        })
    })
})
