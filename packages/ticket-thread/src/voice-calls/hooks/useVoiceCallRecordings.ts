import { useListVoiceCallRecordings } from '@gorgias/helpdesk-queries'

export function useVoiceCallRecordings(callId: number) {
    const { data, isLoading, isError } = useListVoiceCallRecordings(
        { call_id: callId },
        {
            query: {
                staleTime: Infinity,
            },
        },
    )

    return {
        recordings: data?.data?.data,
        isLoading,
        isError,
    }
}
