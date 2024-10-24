import {createContext} from 'react'

import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import {TemplateTypeFilterOption} from 'pages/tickets/detail/components/ReplyArea/types'

import {WhatsAppMessageTemplateSearchFilters} from './WhatsAppMessageTemplateSearch'

export type WhatsAppEditorContextState = {
    selectedTemplateType: TemplateTypeFilterOption
    setSelectedTemplateType: (templateType: TemplateTypeFilterOption) => void
    setIsTemplateListVisible: (isCollapsed: boolean) => void
    selectNewTemplate: (template: WhatsAppMessageTemplate) => void
    setSearchFilter: (
        searchFilter: WhatsAppMessageTemplateSearchFilters
    ) => void
    cleanupEditorState: () => void
    showWhatsAppTemplateEditor: boolean
    isTemplateListVisible: boolean
    selectedTemplate?: WhatsAppMessageTemplate
    isWhatsAppWindowOpen: boolean
    searchFilter: WhatsAppMessageTemplateSearchFilters
}

export const Context = createContext<WhatsAppEditorContextState>({
    selectedTemplateType: TemplateTypeFilterOption?.Templates,
    setSelectedTemplateType: () => {
        return
    },
    setIsTemplateListVisible: () => {
        return
    },
    selectNewTemplate: () => {
        return
    },
    setSearchFilter: () => {
        return
    },
    cleanupEditorState: () => {
        return
    },
    showWhatsAppTemplateEditor: false,
    isTemplateListVisible: false,
    selectedTemplate: undefined,
    isWhatsAppWindowOpen: false,
    searchFilter: {
        language: [],
        name: '',
    },
})
