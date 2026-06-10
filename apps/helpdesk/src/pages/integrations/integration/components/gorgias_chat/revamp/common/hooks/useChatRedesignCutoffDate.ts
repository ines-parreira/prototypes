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
 * Resolves the Chat 2.0 "switch back before" cutoff date for the banner copy.
 * The cutoff date is configured server-side on the flag as an ISO date string
 * under the `cut_off_date` key; this hook formats it into a label like "July 15th".
 */
export const useChatRedesignCutoffDate = (): string => {
    const { cut_off_date } = useFlag<ChatRedesignCutoffFlag>(
        FeatureFlagKey.NonAiAgentChatRevampCutoffDate,
        DEFAULT_CUTOFF_FLAG,
    )

    return formatDatetime(cut_off_date, CUTOFF_DATE_LABEL_FORMAT)
}
