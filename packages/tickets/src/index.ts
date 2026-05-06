export { InfobarTicketDetails } from './components/InfobarTicketDetails/InfobarTicketDetails'
export { InfobarTicketDetailsHeaderContainer } from './components/InfobarTicketDetails/components/InfobarTicketDetailsHeaderContainer'
export { TicketInfobarTicketDetailsTagsContainer } from './components/InfobarTicketDetails/components/InfobarTicketTags/TicketInfobarTicketDetailsTagsContainer'
export { InfobarTicketFields } from './components/InfobarTicketDetails/components/InfobarTicketFields/InfobarTicketFields'
export { InfobarTicketDetailsContainer } from './components/InfobarTicketDetails/components/InfobarTicketDetailsContainer'
export { InfobarTicketCustomerDetailsContainer } from './components/InfobarTicketCustomerDetails/components/InfobarTicketCustomerDetailsContainer'
export { useTicketFieldsStore } from './components/InfobarTicketDetails/components/InfobarTicketFields/store/useTicketFieldsStore'
export { useTicketFields } from './components/InfobarTicketDetails/components/InfobarTicketFields/hooks/useTicketFields'
export type { TicketFieldsState } from './components/InfobarTicketDetails/components/InfobarTicketFields/store/useTicketFieldsStore'
export { useDefaultViews, useExpandableDefaultViews } from './sidebar'
export {
    getNumberOrUndefined,
    isNumberInput,
    isTextInput,
} from './components/InfobarCustomerFields/utils'
export type { FieldEventHandlerParams } from './components/InfobarTicketDetails/components/InfobarTicketFields/utils/constants'
export { TagsMultiSelect } from './components/InfobarTicketDetails/components/InfobarTicketTags/TagsMultiSelect'
export type { TagsMultiSelectProps } from './components/InfobarTicketDetails/components/InfobarTicketTags/TagsMultiSelect'
export { InfobarTicketCustomerDetails } from './components/InfobarTicketCustomerDetails/InfobarTicketCustomerDetails'
export { SearchAndPreviewCustomersPanel } from './components/InfobarTicketCustomerDetails/components/SearchAndPreviewCustomersPanel/SearchAndPreviewCustomersPanel'
export { InfobarCustomerFields } from './components/InfobarCustomerFields/InfobarCustomerFields'
export { InfobarTicketCustomerHeader } from './components/InfobarTicketCustomerHeader/InfobarTicketCustomerHeader'
export { NewTicketInfobarTicketCustomerHeader } from './components/InfobarTicketCustomerHeader/NewTicketInfobarTicketCustomerHeader'
export { MultiLevelSelect } from './components/MultiLevelSelect'
export { TeamAssignee } from './components/TicketAssignee'
export { TeamAssigneeSelect } from './components/TicketAssignee'
export { UserAssigneeSelect } from './components/TicketAssignee'
export { PrioritySelect } from './components/TicketPriority'
export { TicketHeader } from './components/TicketHeader/TicketHeader'
export { TicketInfobarNavigation } from './components/InfobarNavigation/TicketInfobarNavigation'

export type {
    EnrichedTicket,
    TicketCustomField,
} from './components/TicketTimelineWidget'
export {
    TicketTimelineWidget,
    TicketListItem,
    TimelineCard,
    TicketHeader as TicketTimelineHeader,
    formatTicketTime,
} from './components/TicketTimelineWidget'
export { AssigneeLabel } from './components/TicketTimelineWidget/AssigneeLabel'
export { TicketFieldsOverflowList } from './components/TicketTimelineWidget/TicketFieldsOverflowList'
export { TicketsLegacyBridgeProvider } from './utils/LegacyBridge'
export type { LegacyBridgeContextType } from './utils/LegacyBridge/context'

export { isInternalNote } from './helpers/isInternalNote'

export { useCurrentUserId } from './hooks/useCurrentUserId'
export { useTicketViewNavigation } from './hooks/useTicketViewNavigation'

export { TicketTranslationMenu } from './translations/components/TicketTranslationMenu'
export { TranslateTicketModal } from './translations/components/TranslateTicketModal'
export { TranslateTicketModalContext } from './translations/context/TranslateTicketModalContext'
export { TranslateTicketModalProvider } from './translations/context/TranslateTicketModalProvider'
export { useTranslateTicketModal } from './translations/hooks/useTranslateTicketModal'
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
export { useRetranslateTicket } from './translations/hooks/useRetranslateTicket'

export { DisplayedContent, FetchingState } from './translations/store/constants'

export type { CurrentUser } from './translations/hooks/useCurrentUserLanguagePreferences'
export type { DisplayType } from './translations/store/constants'

export { useCloseTicket } from './components/TicketStatusActions/useCloseTicket'
export { useTicketFieldsValidation } from './components/InfobarTicketDetails/components/InfobarTicketFields/hooks/useTicketFieldsValidation'
export { FieldRow } from './components/InfobarCustomerFields/components/FieldRow'
export type { FieldRowProps } from './components/InfobarCustomerFields/components/FieldRow'
export { EditableField } from './components/InfobarCustomerFields/components/EditableField'

export { InfobarTicketCustomerInstagramSection } from './components/InfobarTicketCustomerInstagram/InfobarTicketCustomerInstagramSection'

export {
    CollapsedDefaultViews,
    DefaultViewsMenu,
    IconWithDot,
    SYSTEM_VIEW_DEFINITIONS,
    TicketSectionActionsMenu,
} from './sidebar'

// Layout components
export { TicketLayout, TicketLayoutContent } from './layout/TicketLayout'
export { TicketHeaderContainer } from './components/TicketHeader/layout/TicketHeaderLayout'
export { TicketHeaderLeft } from './components/TicketHeader/layout/TicketHeaderLayout'
export { TicketHeaderRight } from './components/TicketHeader/layout/TicketHeaderLayout'
export {
    TicketTitle,
    TicketTitleCustomer,
    TicketTitleSubject,
} from './components/TicketHeader/TicketTitle'

export { MacroActionName } from './utils/macros/types'
export type { MacroResponseActionName } from './utils/macros/types'
export { getMacroTicketFieldValues } from './components/InfobarTicketDetails/components/InfobarTicketFields/utils/getMacroTicketFieldValues'
export { upsertTicketMessageInListMessagesCache } from './utils/optimisticUpdates/ticketMessagesCache'
export { ticketMessageSourceToIconName } from './components/TicketMessageSourceIcon/utils'
export type { TicketMessageSource } from './components/TicketMessageSourceIcon/utils'
export { formatPhoneNumberInternational } from './utils/validation'
