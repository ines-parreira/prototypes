import MockAdapter from 'axios-mock-adapter'

import {voiceCall} from 'fixtures/voiceCalls'
import client from 'models/api/resources'

import {
    listVoiceCalls,
    listVoiceCallRecordings,
    listVoiceCallEvents,
} from '../resources'

const mockedServer = new MockAdapter(client)

describe('list voice calls resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('listVoiceCalls', () => {
        it('should resolve with a list of VoiceCalls on success', async () => {
            mockedServer
                .onGet('/api/phone/voice-calls/', {params: {ticket_id: 123}})
                .reply(200, {data: [voiceCall]})
            const res = await listVoiceCalls({ticket_id: 123})
            expect(res).toEqual({data: [voiceCall]})
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/phone/voice-calls/')
                .reply(404, {message: 'error'})
            return expect(listVoiceCalls()).rejects.toEqual(
                new Error('Request failed with status code 404')
            )
        })
    })

    describe('listVoiceCallRecordings', () => {
        it('should resolve with a list of VoiceCallRecordings on success', async () => {
            mockedServer
                .onGet('/api/phone/voice-call-recordings/', {
                    params: {call_id: 123},
                })
                .reply(200, {data: [voiceCall]})
            const res = await listVoiceCallRecordings({call_id: 123})
            expect(res.data).toEqual({data: [voiceCall]})
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/phone/voice-call-recordings/')
                .reply(404, {message: 'error'})
            return expect(listVoiceCallRecordings()).rejects.toEqual(
                new Error('Request failed with status code 404')
            )
        })
    })

    describe('listVoiceCallEvents', () => {
        it('should resolve with a list of VoiceCallEvents on success', async () => {
            mockedServer
                .onGet('/api/phone/voice-call-events/', {
                    params: {call_id: 123},
                })
                .reply(200, {data: [voiceCall]})
            const res = await listVoiceCallEvents({call_id: 123})
            expect(res.data).toEqual({data: [voiceCall]})
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/phone/voice-call-events/')
                .reply(404, {message: 'error'})
            return expect(listVoiceCallEvents()).rejects.toEqual(
                new Error('Request failed with status code 404')
            )
        })
    })
})
