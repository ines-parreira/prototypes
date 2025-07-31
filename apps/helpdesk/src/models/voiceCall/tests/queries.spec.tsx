import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    useListRecordings,
    useListVoiceCallEvents,
    useListVoiceCalls,
} from '../queries'
import * as resources from '../resources'

const listVoiceCallsSpy = jest.spyOn(resources, 'listVoiceCalls')
const listVoiceCallRecordingsSpy = jest.spyOn(
    resources,
    'listVoiceCallRecordings',
)
const listVoiceCallEventsSpy = jest.spyOn(resources, 'listVoiceCallEvents')

const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('voiceCall queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('useListVoiceCalls', () => {
        const voiceCalls = ['testVoiceCall']

        it('should return correct data on success', async () => {
            listVoiceCallsSpy.mockResolvedValueOnce(
                axiosSuccessResponse(voiceCalls) as any,
            )
            const { result } = renderHook(
                () => useListVoiceCalls({ ticket_id: 1 }),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data?.data).toStrictEqual(voiceCalls)
        })

        it('should return expected error on failure', async () => {
            listVoiceCallsSpy.mockRejectedValueOnce(Error('test error'))
            const { result } = renderHook(
                () => useListVoiceCalls({ ticket_id: 1 }),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })

    describe('useListRecordings', () => {
        it('should return correct data on success', async () => {
            listVoiceCallRecordingsSpy.mockResolvedValueOnce(
                axiosSuccessResponse(['testRecording']) as any,
            )
            const recordings = ['testRecording']
            const { result } = renderHook(
                () => useListRecordings({ call_id: 1 }),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data?.data).toStrictEqual(recordings)
        })

        it('should return expected error on failure', async () => {
            listVoiceCallRecordingsSpy.mockRejectedValueOnce(
                Error('test error'),
            )
            const { result } = renderHook(
                () => useListRecordings({ call_id: 1 }),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })

    describe('useListVoiceCallEvents', () => {
        it('should return correct data on success', async () => {
            listVoiceCallEventsSpy.mockResolvedValueOnce(
                axiosSuccessResponse(['testEvent']) as any,
            )
            const events = ['testEvent']
            const { result } = renderHook(
                () => useListVoiceCallEvents({ call_id: 1 }),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data?.data).toStrictEqual(events)
        })

        it('should return expected error on failure', async () => {
            listVoiceCallEventsSpy.mockRejectedValueOnce(Error('test error'))
            const { result } = renderHook(
                () => useListVoiceCallEvents({ call_id: 1 }),
                {
                    wrapper,
                },
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })
})
