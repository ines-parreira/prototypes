import { useEffect, useMemo, useState } from 'react'

import { VoiceCallDisplayStatus } from 'models/voiceCall/types'

import {
    VoiceCallFilterDirection,
    VoiceCallFilterOptions,
} from '../../models/types'

const FULL_OUTBOUND_STATUS_FILTER = [
    VoiceCallDisplayStatus.Answered,
    VoiceCallDisplayStatus.Unanswered,
    VoiceCallDisplayStatus.Failed,
]

export default function useVoiceCallFilterOptions(
    onFilterSelect: (value: VoiceCallFilterOptions) => void,
    shouldDisplayCallbackRequests: boolean = false,
) {
    const FULL_INBOUND_STATUS_FILTER = useMemo(
        () =>
            shouldDisplayCallbackRequests
                ? [
                      VoiceCallDisplayStatus.Answered,
                      VoiceCallDisplayStatus.Missed,
                      VoiceCallDisplayStatus.Cancelled,
                      VoiceCallDisplayStatus.Abandoned,
                      VoiceCallDisplayStatus.CallbackRequested,
                  ]
                : [
                      VoiceCallDisplayStatus.Answered,
                      VoiceCallDisplayStatus.Missed,
                      VoiceCallDisplayStatus.Cancelled,
                      VoiceCallDisplayStatus.Abandoned,
                  ],
        [shouldDisplayCallbackRequests],
    )

    const [selectedDirection, setSelectedDirection] = useState(
        VoiceCallFilterDirection.All,
    )

    const [inboundStatusFilter, setInboundStatusFilter] = useState(
        FULL_INBOUND_STATUS_FILTER,
    )
    const [outboundStatusFilter, setOutboundStatusFilter] = useState(
        FULL_OUTBOUND_STATUS_FILTER,
    )

    useEffect(() => {
        // TODO: remove after removing shouldDisplayCallbackRequests
        setInboundStatusFilter(FULL_INBOUND_STATUS_FILTER)
    }, [FULL_INBOUND_STATUS_FILTER])

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
    }, [selectedDirection, FULL_INBOUND_STATUS_FILTER])

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
