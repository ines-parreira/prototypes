import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import * as resources from '../resources'
import {useListVoiceCalls} from '../queries'

const listVoiceCallsSpy = jest.spyOn(resources, 'listVoiceCalls')

const queryClient = createTestQueryClient()
const wrapper = ({children}: any) => (
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
                axiosSuccessResponse(voiceCalls) as any
            )
            const {result, waitFor} = renderHook(
                () => useListVoiceCalls({ticket_id: 1}),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data?.data).toStrictEqual(voiceCalls)
        })

        it('should return expected error on failure', async () => {
            listVoiceCallsSpy.mockRejectedValueOnce(Error('test error'))
            const {result, waitFor} = renderHook(
                () => useListVoiceCalls({ticket_id: 1}),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })
})
