import { Moment } from 'moment'

import colors from '@gorgias/design-tokens/tokens/colors'

import { TicketChannel } from 'business/types/ticket'
import {
    dateInPastFromStartOfToday,
    endOfLastMonth,
    endOfToday,
    last365DaysStartingFromToday,
    lastWeekDateRange,
    StartDayOfWeek,
    startOfLastMonth,
    startOfMonth,
    startOfToday,
} from 'domains/reporting/pages/common/utils'

export const DEFAULT_TIMEZONE = 'UTC'

export const AUTOMATION_INTENTS_CHANNELS = [
    TicketChannel.Api,
    TicketChannel.Chat,
    TicketChannel.ContactForm,
    TicketChannel.Email,
    TicketChannel.Facebook,
    TicketChannel.FacebookMention,
    TicketChannel.FacebookMessenger,
    TicketChannel.HelpCenter,
    TicketChannel.InstagramAdComment,
    TicketChannel.InstagramComment,
    TicketChannel.InstagramDirectMessage,
    TicketChannel.InstagramMention,
    TicketChannel.Phone,
    TicketChannel.Sms,
    TicketChannel.Twitter,
    TicketChannel.TwitterDirectMessage,
    TicketChannel.WhatsApp,
    TicketChannel.YotpoReview,
]
export const DOWNLOAD_DATA_BUTTON_LABEL = 'Download data'

export const TODAY = 'Today'
export const YESTERDAY = 'Yesterday'
export const MONTH_TO_DATE = 'Month to date'
export const LAST_WEEK_SUN = 'Last week (start on Sun)'
export const LAST_WEEK_MON = 'Last week (start on Mon)'
export const LAST_MONTH = 'Last month'
export const PAST_7_DAYS = 'Past 7 days'
export const PAST_30_DAYS = 'Past 30 days'
export const PAST_60_DAYS = 'Past 60 days'
export const PAST_90_DAYS = 'Past 90 days'
export const PAST_YEAR = 'Past year'

export const getDefaultSetOfRanges = (): {
    [key: string]: [Moment, Moment]
} => ({
    [TODAY]: [startOfToday(), endOfToday()],
    [PAST_7_DAYS]: [dateInPastFromStartOfToday(7), endOfToday()],
    [PAST_30_DAYS]: [dateInPastFromStartOfToday(30), endOfToday()],
    [PAST_60_DAYS]: [dateInPastFromStartOfToday(60), endOfToday()],
    [PAST_90_DAYS]: [dateInPastFromStartOfToday(90), endOfToday()],
})

export const getNewSetOfRanges = ({
    adjustments = {},
    excludeOptions = [],
}: {
    adjustments?: {
        [key: string]: {
            start?: ((date: Moment) => Moment)[]
            end?: ((date: Moment) => Moment)[]
        }
    }
    excludeOptions?: string[]
} = {}): { [key: string]: [Moment, Moment] } => {
    const applyAdjustments = (
        date: Moment,
        adjustments: ((date: Moment) => Moment)[] = [],
    ): Moment => {
        return adjustments.reduce(
            (adjustedDate, adjustFn) => adjustFn(adjustedDate),
            date,
        )
    }

    const defaultSetOfRanges = getDefaultSetOfRanges()
    const ranges: { [key: string]: [Moment, Moment] } = {
        [TODAY]: [
            applyAdjustments(
                defaultSetOfRanges[TODAY][0],
                adjustments[TODAY]?.start,
            ),
            applyAdjustments(
                defaultSetOfRanges[TODAY][1],
                adjustments[TODAY]?.end,
            ),
        ],
        [YESTERDAY]: [
            applyAdjustments(
                dateInPastFromStartOfToday(2),
                adjustments[YESTERDAY]?.start,
            ),
            applyAdjustments(
                startOfToday().subtract(1, 'seconds'),
                adjustments[YESTERDAY]?.end,
            ),
        ],
        [MONTH_TO_DATE]: [
            startOfMonth(), // Base date
            applyAdjustments(endOfToday(), adjustments[MONTH_TO_DATE]?.end), // Adjustments applied to base date
        ],
        [LAST_WEEK_SUN]: [
            lastWeekDateRange(StartDayOfWeek.Sunday).start,
            applyAdjustments(
                lastWeekDateRange(StartDayOfWeek.Sunday).end,
                adjustments[LAST_WEEK_SUN]?.end,
            ),
        ],
        [LAST_WEEK_MON]: [
            lastWeekDateRange(StartDayOfWeek.Monday).start,
            applyAdjustments(
                lastWeekDateRange(StartDayOfWeek.Monday).end,
                adjustments[LAST_WEEK_MON]?.end,
            ),
        ],
        [LAST_MONTH]: [
            startOfLastMonth(),
            applyAdjustments(endOfLastMonth(), adjustments[LAST_MONTH]?.end),
        ],
        [PAST_7_DAYS]: [
            applyAdjustments(
                defaultSetOfRanges[PAST_7_DAYS][0],
                adjustments[PAST_7_DAYS]?.start,
            ),
            applyAdjustments(
                defaultSetOfRanges[PAST_7_DAYS][1],
                adjustments[PAST_7_DAYS]?.end,
            ),
        ],
        [PAST_30_DAYS]: [
            applyAdjustments(
                defaultSetOfRanges[PAST_30_DAYS][0],
                adjustments[PAST_30_DAYS]?.start,
            ),
            applyAdjustments(
                defaultSetOfRanges[PAST_30_DAYS][1],
                adjustments[PAST_30_DAYS]?.end,
            ),
        ],
        [PAST_60_DAYS]: [
            applyAdjustments(
                defaultSetOfRanges[PAST_60_DAYS][0],
                adjustments[PAST_60_DAYS]?.start,
            ),
            applyAdjustments(
                defaultSetOfRanges[PAST_60_DAYS][1],
                adjustments[PAST_60_DAYS]?.end,
            ),
        ],
        [PAST_90_DAYS]: [
            applyAdjustments(
                defaultSetOfRanges[PAST_90_DAYS][0],
                adjustments[PAST_90_DAYS]?.start,
            ),
            applyAdjustments(
                defaultSetOfRanges[PAST_90_DAYS][1],
                adjustments[PAST_90_DAYS]?.end,
            ),
        ],
        [PAST_YEAR]: [
            applyAdjustments(
                last365DaysStartingFromToday(),
                adjustments[PAST_YEAR]?.start,
            ),
            applyAdjustments(endOfToday(), adjustments[PAST_YEAR]?.end),
        ],
    }

    if (excludeOptions) {
        excludeOptions.forEach((option) => {
            delete ranges[option]
        })
    }

    return ranges
}

export const LINES_COLORS = [
    colors.modern.main.variations.primary_2.value,
    colors.modern.feedback.variations.warning_4.value,
    colors.classic.accessory.purple_text.value,
    colors.classic.accessory.yellow_text.value,
    colors.classic.accessory.blue_text.value,
    colors.classic.accessory.brown_text.value,
    colors.modern.neutral.grey_5.value,
    colors.classic.feedback.variations.success_4.value,
    colors.classic.accessory.navy_text.value,
    colors.dark.main.secondary.value,
]
