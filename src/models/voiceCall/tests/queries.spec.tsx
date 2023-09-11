import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import * as resources from '../resources'
import {useListTicketVoiceCalls} from '../queries'

const listTicketVoiceCallsSpy = jest.spyOn(resources, 'listTicketVoiceCalls')

const queryClient = createTestQueryClient()
const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('voiceCall queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('useListTicketVoiceCalls', () => {
        const voiceCalls = ['testVoiceCall']

        it('should return correct data on success', async () => {
            listTicketVoiceCallsSpy.mockResolvedValueOnce(
                axiosSuccessResponse(voiceCalls) as any
            )
            const {result, waitFor} = renderHook(
                () => useListTicketVoiceCalls({ticket_id: 1}),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data?.data).toStrictEqual(voiceCalls)
        })

        it('should return expected error on failure', async () => {
            listTicketVoiceCallsSpy.mockRejectedValueOnce(Error('test error'))
            const {result, waitFor} = renderHook(
                () => useListTicketVoiceCalls({ticket_id: 1}),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })
})
