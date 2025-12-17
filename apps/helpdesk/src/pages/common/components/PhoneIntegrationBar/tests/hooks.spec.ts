import { act, renderHook, waitFor } from '@testing-library/react'
import type { Call } from '@twilio/voice-sdk'

import {
    mockIncomingCall,
    mockOutgoingCall,
} from '../../../../../tests/twilioMocks'
import { useAudioLevel, useConnectionParameters } from '../hooks'

describe('useConnectionParameters()', () => {
    it('should return parameters for an incoming call', () => {
        const call = mockIncomingCall() as Call
        const parameters = useConnectionParameters(call)

        expect(parameters).toEqual({
            customerName: 'Bob',
            customerPhoneNumber: '+25111111111',
            integrationId: 1,
            ticketId: 2,
            transferFromAgentId: null,
            isTransferring: false,
            isPossibleSpam: false,
        })
    })

    it('should return parameters for an outgoing call', () => {
        const call = mockOutgoingCall() as Call
        const parameters = useConnectionParameters(call)

        expect(parameters).toEqual({
            customerName: 'Bob',
            customerPhoneNumber: '+14158880101',
            integrationId: 1,
            ticketId: null,
            transferFromAgentId: null,
            isTransferring: false,
            isPossibleSpam: false,
        })
    })

    it('should return parameters for an incoming call transferred from agent', () => {
        const call = mockIncomingCall(1, 2) as Call
        call.customParameters.set('transfer.from', '3')
        const parameters = useConnectionParameters(call)

        expect(parameters.transferFromAgentId).toEqual(3)
        expect(parameters.isTransferring).toEqual(false)
    })

    it.each([
        { customParameterValue: 'True', isTransferring: true },
        { customParameterValue: 'False', isTransferring: false },
        { customParameterValue: '', isTransferring: false },
    ])(
        'should detect transfer when transfer parameter is present',
        ({ customParameterValue, isTransferring }) => {
            const call = mockIncomingCall(1, 2) as Call
            call.customParameters.set('transfer', customParameterValue)
            const parameters = useConnectionParameters(call)

            expect(parameters.isTransferring).toEqual(isTransferring)
        },
    )

    it.each([
        { customParameterValue: 'true', isPossibleSpam: true },
        { customParameterValue: 'True', isPossibleSpam: true },
        { customParameterValue: 'false', isPossibleSpam: false },
        { customParameterValue: 'False', isPossibleSpam: false },
        { customParameterValue: '', isPossibleSpam: false },
    ])(
        'should detect spam when is_possible_spam parameter is present for incoming call',
        ({ customParameterValue, isPossibleSpam }) => {
            const call = mockIncomingCall(1, 2) as Call
            call.customParameters.set('is_possible_spam', customParameterValue)
            const parameters = useConnectionParameters(call)

            expect(parameters.isPossibleSpam).toEqual(isPossibleSpam)
        },
    )

    it('should return isPossibleSpam as false for outgoing calls', () => {
        const call = mockOutgoingCall() as Call
        call.customParameters.set('is_possible_spam', 'true')
        const parameters = useConnectionParameters(call)

        expect(parameters.isPossibleSpam).toEqual(false)
    })
})

describe('useAudioLevel', () => {
    it('should update audio level when volume event is emitted', async () => {
        const call = mockIncomingCall() as Call
        const { result } = renderHook(() => useAudioLevel(call))

        expect(result.current).toBe(0)

        act(() => {
            call.emit('volume', 0.5)
        })

        await waitFor(() => {
            expect(result.current).toBe(0.5)
        })
    })

    it('should clean up event listener on unmount', async () => {
        const call = mockIncomingCall() as Call
        const { result, unmount } = renderHook(() => useAudioLevel(call))

        act(() => {
            call.emit('volume', 0.5)
        })
        await waitFor(() => {
            expect(result.current).toBe(0.5)
        })

        unmount()

        act(() => {
            call.emit('volume', 0.9)
        })
        expect(result.current).toBe(0.5)
    })
})
