import {Moment} from 'moment'
import {TicketChannel} from 'business/types/ticket'
import {
    endOfLastMonth,
    endOfToday,
    lastWeekDateRange,
    StartDayOfWeek,
    startOfLastMonth,
    startOfMonth,
    dateInPastFromStartOfToday,
    startOfToday,
    last365DaysStartingFromToday,
} from 'pages/stats/common/utils'

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
export const PAST_7_DAYS = 'Past 7 days'
export const PAST_30_DAYS = 'Past 30 days'
export const PAST_60_DAYS = 'Past 60 days'
export const PAST_90_DAYS = 'Past 90 days'

export const getDefaultSetOfRanges = (): {
    [key: string]: [Moment, Moment]
} => ({
    [TODAY]: [startOfToday(), endOfToday()],
    [PAST_7_DAYS]: [dateInPastFromStartOfToday(7), endOfToday()],
    [PAST_30_DAYS]: [dateInPastFromStartOfToday(30), endOfToday()],
    [PAST_60_DAYS]: [dateInPastFromStartOfToday(60), endOfToday()],
    [PAST_90_DAYS]: [dateInPastFromStartOfToday(90), endOfToday()],
})

export const getNewSetOfRanges = (): {[key: string]: [Moment, Moment]} => {
    const defaultSetOfRanges = getDefaultSetOfRanges()
    return {
        [TODAY]: defaultSetOfRanges[TODAY],
        Yesterday: [
            dateInPastFromStartOfToday(2),
            startOfToday().subtract(1, 'seconds'),
        ],
        'Month to date': [startOfMonth(), endOfToday()],
        'Last week (start on Sun)': [
            lastWeekDateRange(StartDayOfWeek.Sunday).start,
            lastWeekDateRange(StartDayOfWeek.Sunday).end,
        ],
        'Last week (start on Mon)': [
            lastWeekDateRange(StartDayOfWeek.Monday).start,
            lastWeekDateRange(StartDayOfWeek.Monday).end,
        ],
        'Last month': [startOfLastMonth(), endOfLastMonth()],
        [PAST_7_DAYS]: defaultSetOfRanges[PAST_7_DAYS],
        [PAST_30_DAYS]: defaultSetOfRanges[PAST_30_DAYS],
        [PAST_60_DAYS]: defaultSetOfRanges[PAST_60_DAYS],
        [PAST_90_DAYS]: defaultSetOfRanges[PAST_90_DAYS],
        'Past year': [last365DaysStartingFromToday(), endOfToday()],
    }
}
