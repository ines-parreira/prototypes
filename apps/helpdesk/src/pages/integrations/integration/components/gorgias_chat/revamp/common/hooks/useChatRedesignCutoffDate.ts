import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { formatDatetime } from '@repo/utils'

type ChatRedesignCutoffFlag = {
    cut_off_date: string
}

const DEFAULT_CUTOFF_FLAG: ChatRedesignCutoffFlag = {
    cut_off_date: '2026-08-01',
}
const CUTOFF_DATE_LABEL_FORMAT = 'MMMM Do'

/**
 * Resolves the Chat 2.0 "switch back before" cutoff date. The cutoff date is
 * configured server-side on the flag as an ISO date string under the
 * `cut_off_date` key. Returns both the formatted label (like "July 15th") for
 * banner/modal copy and whether the cutoff has already passed — once past, all
 * opt-in UI is hidden.
 */
export const useChatRedesignCutoffDate = (): {
    cutoffDateLabel: string
    isPastCutoff: boolean
} => {
    const { cut_off_date } = useFlag<ChatRedesignCutoffFlag>(
        FeatureFlagKey.NonAiAgentChatRevampCutoffDate,
        DEFAULT_CUTOFF_FLAG,
    )

    return {
        cutoffDateLabel: formatDatetime(cut_off_date, CUTOFF_DATE_LABEL_FORMAT),
        isPastCutoff: new Date() >= new Date(cut_off_date),
    }
}
