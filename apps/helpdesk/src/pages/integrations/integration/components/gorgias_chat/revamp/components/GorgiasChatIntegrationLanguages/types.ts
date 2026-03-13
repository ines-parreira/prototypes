import type { LanguageItem } from 'config/integrations/gorgias_chat'

export interface LanguageItemRow extends LanguageItem {
    label: string
    link: string
    showActions: boolean
}
