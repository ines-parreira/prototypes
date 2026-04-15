export type ActivityParticipant = {
    id: number | string
    name?: string | null
    meta?: {
        profile_picture_url?: string | null
    } | null
}

type GetActivityParticipantTextPartsParams = {
    index: number
    hiddenCount: number
    visibleParticipantsCount: number
}

export function getActivityParticipantTextParts({
    index,
    hiddenCount,
    visibleParticipantsCount,
}: GetActivityParticipantTextPartsParams) {
    const isLastVisibleParticipant = index === visibleParticipantsCount - 1
    const shouldPrefixWithAnd =
        hiddenCount === 0 &&
        visibleParticipantsCount > 1 &&
        isLastVisibleParticipant
    const shouldAppendComma =
        // not the last visible participant
        index < visibleParticipantsCount - 1 &&
        // hidden count > 0 or not the second last visible participant, as that will be prefixed with 'and'
        (hiddenCount > 0 || index < visibleParticipantsCount - 2)
    const suffix = shouldAppendComma ? ', ' : ''

    return {
        suffix,
        shouldPrefixWithAnd,
    }
}

export function formatHiddenParticipantsLabel(hiddenCount: number) {
    return hiddenCount === 1 ? '1 other' : `${hiddenCount} others`
}
