import { useEffect, useRef } from 'react'

import { IngestionLogStatus } from '../AiAgentScrapedDomainContent/constant'
import { useGetStoreDomainIngestionLog } from './useGetStoreDomainIngestionLog'

export const usePollStoreDomainIngestionLog = ({
    helpCenterId,
    storeUrl,
    onStatusChange,
}: {
    helpCenterId: number
    storeUrl: string | null
    onStatusChange?: (status: string | null) => void
}) => {
    const { status, isGetIngestionLogsLoading: isFetchLoading } =
        useGetStoreDomainIngestionLog({
            helpCenterId,
            storeUrl,
            shouldPoll: true,
        })

    const previousStatusRef = useRef<string | null>(null)

    useEffect(() => {
        // reset the status when the storeUrl changes
        previousStatusRef.current = null
        onStatusChange?.(null)
    }, [storeUrl, onStatusChange])

    useEffect(() => {
        if (!status || isFetchLoading) return

        // initially set the status only if the status is pending
        if (status === IngestionLogStatus.Pending) {
            previousStatusRef.current = status
            onStatusChange?.(status)
        }

        // if the status is initially not pending, we don't want to set it
        if (previousStatusRef.current === null) return

        // change the status only if it is different from the previous one (not pending)
        if (status !== previousStatusRef.current) {
            previousStatusRef.current = status

            if (status !== IngestionLogStatus.Pending) {
                onStatusChange?.(status)
            }
        }
    }, [status, isFetchLoading, onStatusChange])

    return {
        ingestionLogStatus: status,
        syncIsPending: status === IngestionLogStatus.Pending,
    }
}
