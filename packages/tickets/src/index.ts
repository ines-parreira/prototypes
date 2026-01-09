export { InfobarTicketDetails } from './components/InfobarTicketDetails/InfobarTicketDetails'
export { InfobarTicketCustomerDetails } from './components/InfobarTicketCustomerDetails/InfobarTicketCustomerDetails'
export { MultiLevelSelect } from './components/MultiLevelSelect'
export { TeamAssignee } from './components/TicketAssignee'
export { TicketHeader } from './components/TicketHeader/TicketHeader'
export { TicketInfobarNavigation } from './components/TicketInfobarNavigation'
export { TicketTimelineWidget } from './components/TicketTimelineWidget'

export type {
    EnrichedTicket,
    TicketCustomField,
} from './components/TicketTimelineWidget'

export { TicketsLegacyBridgeProvider } from './utils/LegacyBridge'
export type { LegacyBridgeContextType } from './utils/LegacyBridge/context'

export { isInternalNote } from './helpers/isInternalNote'

export { useLiveTicketTranslationsUpdates } from './translations/hooks/useLiveTicketTranslationsUpdates/useLiveTicketTranslationsUpdates'
export {
    useTicketMessageTranslationDisplay,
    useTicketMessageDisplayState,
} from './translations/store/useTicketMessageTranslationDisplay'
export { useTicketMessageTranslation } from './translations/hooks/useTicketMessageTranslation'
export { useTicketTranslations } from './translations/hooks/useTicketTranslations'
export { useTicketsTranslatedProperties } from './translations/hooks/useTicketsTranslatedProperties'
export { useRegenerateTicketMessageTranslations } from './translations/hooks/useRegenerateTicketMessageTranslations'
export { useTicketMessageTranslations } from './translations/hooks/useTicketMessageTranslations'
export { useCurrentUserLanguagePreferences } from './translations/hooks/useCurrentUserLanguagePreferences'

export { DisplayedContent, FetchingState } from './translations/store/constants'

export type { CurrentUser } from './translations/hooks/useCurrentUserLanguagePreferences'
export type { ExtractEvent } from './translations/hooks/types'
export type { DisplayType } from './translations/store/constants'

export { useHelpdeskV2MS1Flag } from './feature-flags/useHelpdeskV2MS1Flag'
export { useHelpdeskV2MS1Dot5Flag } from './feature-flags/useHelpdeskV2MS1-5Flag'
