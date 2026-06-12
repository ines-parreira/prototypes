import client from '@repo/api-resources'
import MockAdapter from 'axios-mock-adapter'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockSearchVoiceCallsHandler } from '@gorgias/helpdesk-mocks'
import type { SearchVoiceCalls200 } from '@gorgias/helpdesk-types'

import { voiceCall } from 'fixtures/voiceCalls'
import { Cancel, CancelToken } from 'tests/axiosRuntime'

import {
    listVoiceCallEvents,
    listVoiceCallRecordings,
    listVoiceCalls,
    searchVoiceCalls,
    searchVoiceCallsWithHighlights,
} from '../resources'

const mockedServer = new MockAdapter(client)
const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('list voice calls resources', () => {
    const defaultSearchData: SearchVoiceCalls200 = {
        data: [
            {
                entity: voiceCall as any,
                highlights: {},
            },
        ],
        meta: { next_cursor: '', prev_cursor: null },
        object: 'list',
        uri: '/integrations/phone/search',
    }
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('listVoiceCalls', () => {
        it('should resolve with a list of VoiceCalls on success', async () => {
            mockedServer
                .onGet('/api/phone/voice-calls/', {
                    params: { ticket_id: 123 },
                })
                .reply(200, { data: [voiceCall] })
            const res = await listVoiceCalls({ ticket_id: 123 })
            expect(res).toEqual({ data: [voiceCall] })
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/phone/voice-calls/')
                .reply(404, { message: 'error' })
            return expect(listVoiceCalls()).rejects.toEqual(
                new Error('Request failed with status code 404'),
            )
        })
    })

    describe('listVoiceCallRecordings', () => {
        it('should resolve with a list of VoiceCallRecordings on success', async () => {
            mockedServer
                .onGet('/api/phone/voice-call-recordings/', {
                    params: { call_id: 123 },
                })
                .reply(200, { data: [voiceCall] })
            const res = await listVoiceCallRecordings({ call_id: 123 })
            expect(res.data).toEqual({ data: [voiceCall] })
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/phone/voice-call-recordings/')
                .reply(404, { message: 'error' })
            return expect(listVoiceCallRecordings()).rejects.toEqual(
                new Error('Request failed with status code 404'),
            )
        })
    })

    describe('listVoiceCallEvents', () => {
        it('should resolve with a list of VoiceCallEvents on success', async () => {
            mockedServer
                .onGet('/api/phone/voice-call-events/', {
                    params: { call_id: 123 },
                })
                .reply(200, { data: [voiceCall] })
            const res = await listVoiceCallEvents({ call_id: 123 })
            expect(res.data).toEqual({ data: [voiceCall] })
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/phone/voice-call-events/')
                .reply(404, { message: 'error' })
            return expect(listVoiceCallEvents()).rejects.toEqual(
                new Error('Request failed with status code 404'),
            )
        })
    })

    describe('searchVoiceCalls', () => {
        it('should resolve with the call list and meta on success', async () => {
            server.use(
                mockSearchVoiceCallsHandler(async () =>
                    HttpResponse.json(defaultSearchData),
                ).handler,
            )

            const res = await searchVoiceCalls({
                search: '',
            })

            expect(res.data).toEqual(defaultSearchData)
        })

        it('should pass the search phrase and filters in the payload', async () => {
            const searchVoiceCallsMock = mockSearchVoiceCallsHandler()
            const waitForSearchVoiceCallsRequest =
                searchVoiceCallsMock.waitForRequest(server)
            server.use(searchVoiceCallsMock.handler)
            const options = {
                search: 'foo',
            }

            await searchVoiceCalls(options)

            await waitForSearchVoiceCallsRequest(async (request) => {
                expect(await request.json()).toEqual(options)
                expect(new URL(request.url).search).toBe('')
            })
        })

        it('should pass cursor and limit in the params', async () => {
            const searchVoiceCallsMock = mockSearchVoiceCallsHandler()
            const waitForSearchVoiceCallsRequest =
                searchVoiceCallsMock.waitForRequest(server)
            server.use(searchVoiceCallsMock.handler)
            const options = {
                search: 'foo',
            }
            const cursor = 'some_cursor'
            const limit = 10

            await searchVoiceCalls({
                ...options,
                cursor,
                limit,
            })

            await waitForSearchVoiceCallsRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual(options)
                expect(searchParams.get('cursor')).toBe(cursor)
                expect(searchParams.get('limit')).toBe(String(limit))
            })
        })

        it('should pass cancel token', async () => {
            const source = CancelToken.source()
            source.cancel()

            await expect(
                searchVoiceCalls({
                    search: '',
                    cancelToken: source.token,
                }),
            ).rejects.toBeInstanceOf(Cancel)
        })

        it('should add with_highlights prop', async () => {
            const searchVoiceCallsMock = mockSearchVoiceCallsHandler()
            const waitForSearchVoiceCallsRequest =
                searchVoiceCallsMock.waitForRequest(server)
            server.use(searchVoiceCallsMock.handler)
            const options = {
                search: 'foo',
            }
            const params = {
                withHighlights: true,
            }

            await searchVoiceCalls({ ...options, ...params })

            await waitForSearchVoiceCallsRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual(options)
                expect(searchParams.get('with_highlights')).toBe('true')
            })
        })
    })

    describe('searchVoiceCallsWithHighlights', () => {
        it('should call searchTickets withHighlights and merge Tickets with their highlights', async () => {
            const searchVoiceCallsMock = mockSearchVoiceCallsHandler(async () =>
                HttpResponse.json(defaultSearchData),
            )
            const waitForSearchVoiceCallsRequest =
                searchVoiceCallsMock.waitForRequest(server)
            server.use(searchVoiceCallsMock.handler)
            const options = { search: 'foo' }

            const response = await searchVoiceCallsWithHighlights(options)

            await waitForSearchVoiceCallsRequest(async (request) => {
                const searchParams = new URL(request.url).searchParams

                expect(await request.json()).toEqual(options)
                expect(searchParams.get('with_highlights')).toBe('true')
            })

            expect(response.data.data).toEqual([
                {
                    ...voiceCall,
                    highlights: {},
                },
            ])
        })
    })
})
