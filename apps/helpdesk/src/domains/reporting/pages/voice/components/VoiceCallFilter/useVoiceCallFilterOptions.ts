import { useMemo, useState } from 'react'

import type { VoiceCallFilterOptions } from 'domains/reporting/pages/voice/models/types'
import { VoiceCallFilterDirection } from 'domains/reporting/pages/voice/models/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'

const FULL_OUTBOUND_STATUS_FILTER = [
    VoiceCallDisplayStatus.Answered,
    VoiceCallDisplayStatus.Unanswered,
    VoiceCallDisplayStatus.Failed,
]
const FULL_INBOUND_STATUS_FILTER = [
    VoiceCallDisplayStatus.Answered,
    VoiceCallDisplayStatus.Missed,
    VoiceCallDisplayStatus.Cancelled,
    VoiceCallDisplayStatus.Abandoned,
    VoiceCallDisplayStatus.CallbackRequested,
]

export default function useVoiceCallFilterOptions(
    onFilterSelect: (value: VoiceCallFilterOptions) => void,
) {
    const [selectedDirection, setSelectedDirection] = useState(
        VoiceCallFilterDirection.All,
    )

    const [inboundStatusFilter, setInboundStatusFilter] = useState(
        FULL_INBOUND_STATUS_FILTER,
    )
    const [outboundStatusFilter, setOutboundStatusFilter] = useState(
        FULL_OUTBOUND_STATUS_FILTER,
    )

    const getStatusFilter = (direction: VoiceCallFilterDirection) => {
        switch (direction) {
            case VoiceCallFilterDirection.Inbound:
                return inboundStatusFilter
            case VoiceCallFilterDirection.Outbound:
                return outboundStatusFilter
            default:
                return undefined
        }
    }
    const statusFilter = getStatusFilter(selectedDirection)
    const fullStatusFilter = useMemo(() => {
        switch (selectedDirection) {
            case VoiceCallFilterDirection.Inbound:
                return FULL_INBOUND_STATUS_FILTER
            case VoiceCallFilterDirection.Outbound:
                return FULL_OUTBOUND_STATUS_FILTER
            default:
                return undefined
        }
    }, [selectedDirection])

    const updateFilter = () => {
        onFilterSelect({ direction: selectedDirection, statuses: statusFilter })
    }

    const updateFilterFromDirection = (direction: VoiceCallFilterDirection) => {
        setSelectedDirection(direction)
        onFilterSelect({ direction, statuses: getStatusFilter(direction) })
    }

    const toggleStatusFromFilter = (status: VoiceCallDisplayStatus) => {
        switch (selectedDirection) {
            case VoiceCallFilterDirection.Inbound:
                setInboundStatusFilter(
                    (prevStatuses) =>
                        prevStatuses.includes(status)
                            ? prevStatuses.filter((s) => s !== status)
                            : FULL_INBOUND_STATUS_FILTER.filter(
                                  (s) =>
                                      prevStatuses.includes(s) || s === status,
                              ), // to keep ordering
                )
                return
            case VoiceCallFilterDirection.Outbound:
                setOutboundStatusFilter(
                    (prevStatuses) =>
                        prevStatuses.includes(status)
                            ? prevStatuses.filter((s) => s !== status)
                            : FULL_OUTBOUND_STATUS_FILTER.filter(
                                  (s) =>
                                      prevStatuses.includes(s) || s === status,
                              ), // to keep ordering
                )
                return
        }
    }

    const removeAllStatusFilter = () => {
        switch (selectedDirection) {
            case VoiceCallFilterDirection.Inbound:
                setInboundStatusFilter([])
                return
            case VoiceCallFilterDirection.Outbound:
                setOutboundStatusFilter([])
                return
        }
    }

    const selectAllStatusFilter = () => {
        switch (selectedDirection) {
            case VoiceCallFilterDirection.Inbound:
                setInboundStatusFilter(FULL_INBOUND_STATUS_FILTER)
                return
            case VoiceCallFilterDirection.Outbound:
                setOutboundStatusFilter(FULL_OUTBOUND_STATUS_FILTER)
                return
        }
    }

    return {
        selectedDirection,
        statusFilter,
        fullStatusFilter,
        updateFilter,
        updateFilterFromDirection,
        toggleStatusFromFilter,
        removeAllStatusFilter,
        selectAllStatusFilter,
    }
}
