import querystring from 'querystring'
import url from 'url'

import MockAdapter from 'axios-mock-adapter'
import axios from 'axios/index'

import {fromJS} from 'immutable'

import GorgiasApi from '../gorgiasApi'
import type {AuditLogEvent} from '../../models/event'
import {TICKET_REOPENED} from '../../constants/event'

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
                    const page = parsedQuery && parsedQuery.page ? parseInt(parsedQuery.page) : 1
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
                        score: '4'
                    }
                })

                const stat = await new GorgiasApi().getStatistic('overview', data)
                expect(stat.toJS()).toEqual(expectedStat)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('downloadStatistic()', () => {
            it('should fetch a statistic with the given name and filters (ready to be downloaded)', async () => {
                const expectedStat = {data: {}, meta: {}}
                const respHeaders = {
                    'content-disposition': 'attachment; filename=support-volume-2019-05-23-2019-05-29.csv',
                    'content-type': 'text/csv'
                }
                apiMock.onAny().reply(200, expectedStat, respHeaders)

                const data = fromJS({
                    filters: {
                        tags: [1, 2],
                        score: '4'
                    }
                })
                const stat = await new GorgiasApi().downloadStatistic('overview', data)
                expect(stat).toMatchSnapshot()
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('startSubscription()', () => {
            it('should start the subscription of the current account.', async () => {
                const expectedSubscription = {
                    plan: 'basic-usd-1',
                    status: 'active'
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
                    exp_year: '23'
                }
                apiMock.onAny().reply(202, expectedCard)
                const stripeCardToken = 'tok_2xe129dnm21d2miwmdfsa'
                const card = await new GorgiasApi().updateCreditCard(fromJS({token: stripeCardToken}))
                expect(card.toJS()).toEqual(expectedCard)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('payInvoice()', () => {
            it('should make an HTTP request to pay an invoice.', async () => {
                const expectedInvoice = {
                    id: 'in_1dj2801j2d',
                    paid: true,
                    amout_due: 35312
                }
                apiMock.onAny().reply(202, expectedInvoice)
                const invoice = await new GorgiasApi().payInvoice(expectedInvoice['id'])
                expect(invoice.toJS()).toEqual(expectedInvoice)
                expect(apiMock.history).toMatchSnapshot()
            })
        })

        describe('confirmInvoicePayment()', () => {
            it('should make an HTTP request to confirm a payment for an invoice.', async () => {
                const expectedInvoice = {
                    id: 'in_mf9u2x3j20z',
                    paid: true,
                    amout_due: 43521
                }
                apiMock.onAny().reply(202, expectedInvoice)
                const invoice = await new GorgiasApi().confirmInvoicePayment(expectedInvoice['id'])
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

                for await (const events of gorgiasApi.getTicketEvents(ticketId)) {
                    pages.push(events)
                }

                expect(pages.length).toBe(mocks.length)
                pages.forEach((page, index) => {
                    expect(page).toEqual(fromJS(mocks[index]))
                })
            })
        })
    })
})
