import { useListVoiceCallEvents } from '@gorgias/helpdesk-queries'

export function useVoiceCallEvents(callId: number) {
    const { data, isLoading, isError } = useListVoiceCallEvents({
        call_id: callId,
    })

    return {
        events: data?.data?.data,
        isLoading,
        isError,
    }
}
