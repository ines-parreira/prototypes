/**
 * This file contains a list of deprecated Segment events.
 * This is used to prevent events from being sent to Segment in a two step process:
 *
 * 1. Add the event to the list in this file which will stop it from being sent to Segment, while retaining the
 * events callsites in the codebase if we need to re-enable it.
 * 2. Once the deprecation time buffer has passed, remove the event from the list and the codebase.
 */
import { SegmentEvent } from './types'

export const deprecatedEvents = [
    // CX Helpdesk deprecation agreement
    SegmentEvent.TicketSendAndCloseButtonClicked,
    SegmentEvent.TicketMergeClicked,
    SegmentEvent.TicketMacrosSearch,
    SegmentEvent.MacroAppliedSearchbar,
    SegmentEvent.MacrosQuickReplyGetDetails,
    SegmentEvent.MacrosQuickReplySent,
    SegmentEvent.MacrosQuickReplyTooltip,
    SegmentEvent.MacroDefaultMacroToSearch,
    SegmentEvent.AiAgentFeedbackTabOpened,
    SegmentEvent.CustomFieldTicketValueDropdownFocused,
    SegmentEvent.CustomFieldTicketValueRequiredMissingError,
    SegmentEvent.CustomFieldTicketValueInputFocused,
    // Product growth deprecation agreement
    SegmentEvent.TicketCloseAction,
    SegmentEvent.SearchQueryRanked,
    SegmentEvent.UserHistoryToggled,
    SegmentEvent.ShopifyOrderClicked,
    SegmentEvent.GlobalSearchOpenButtonClick,
    SegmentEvent.SnoozeButtonClicked,
    SegmentEvent.CustomerTimelineTicketClicked,
    SegmentEvent.TicketNextNavigation,
    SegmentEvent.AiAgentTicketViewed,
    SegmentEvent.BulkAction,
    SegmentEvent.RecentActivityClicked,
    SegmentEvent.TicketKeyboardShortcutsNextNavigation,
    SegmentEvent.NotificationCenter,
    SegmentEvent.MessageThreadClicked,
    SegmentEvent.ShopifyProfileClicked,
    SegmentEvent.InfobarSearchUsed,
    SegmentEvent.TicketKeyboardShortcutsPreviousNavigation,
    SegmentEvent.CreateTicketButtonClicked,
    SegmentEvent.CustomerTimelineModalViewTicketClicked,
    SegmentEvent.AnalyticsStatsDatepickerOpen,
    SegmentEvent.GlobalSearchTicketTabClick,
    SegmentEvent.TicketPreviousNavigation,
]
