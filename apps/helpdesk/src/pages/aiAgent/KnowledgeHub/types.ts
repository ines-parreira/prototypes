import type { IconName } from '@gorgias/axiom'

import type { LocaleCode } from 'models/helpCenter/types'

export enum KnowledgeType {
    Document = 'document',
    FAQ = 'faq',
    Guidance = 'guidance',
    URL = 'url',
    Domain = 'domain',
}

export enum KnowledgeVisibility {
    UNLISTED = 'unlisted',
    PUBLIC = 'public',
}

export type KnowledgeItem = {
    type: KnowledgeType
    title: string
    lastUpdatedAt: string
    inUseByAI?: KnowledgeVisibility
    source?: string
    id: string
    localeCode?: LocaleCode
    actionsCount?: number
    content?: string
}

export type GroupedKnowledgeItem = KnowledgeItem & {
    isGrouped?: boolean
    itemCount?: number
}

export const typeConfig: Record<
    KnowledgeType,
    { icon: IconName; label: string }
> = {
    [KnowledgeType.Document]: {
        icon: 'paperclip-attachment',
        label: 'Documents',
    },
    [KnowledgeType.FAQ]: {
        icon: 'file-document',
        label: 'Help Center articles',
    },
    [KnowledgeType.Guidance]: { icon: 'nav-map', label: 'Guidance' },
    [KnowledgeType.URL]: { icon: 'link-horizontal', label: 'URLs' },
    [KnowledgeType.Domain]: { icon: 'nav-globe', label: 'Store website' },
}
