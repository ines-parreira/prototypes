import type { IconName } from '@gorgias/axiom'
import { Icon } from '@gorgias/axiom'

import { AiAgentKnowledgeResourceTypeEnum } from './types'

export const RESOURCE_ICONS: Record<string, JSX.Element> = {
    'Soft action': <Icon name="media-play-circle" size="xs" />,
    'Hard action': <Icon name="media-play-circle" size="xs" />,
    'Help Center articles': <Icon name="file-document" size="xs" />,
    Macros: <Icon name="file-document" size="xs" />,
    'External websites': <Icon name="file-document" size="xs" />,
    'External files': <Icon name="file-document" size="xs" />,
    Guidance: <Icon name="nav-map" size="xs" />,
}

export const RESOURCE_LABELS: Record<string, string> = {
    soft_action: 'Actions::Soft action::',
    action: 'Actions::',
    hard_action: 'Actions::Hard action::',
    guidance: 'Guidance::',
    article: 'Knowledge::Help Center articles::',
    external_snippet: 'Knowledge::External websites::',
    macro: 'Knowledge::Macros::',
    file_external_snippet: 'Knowledge::External files::',
}

export const QA_FAILED_MESSAGE =
    "didn't respond to this message because it wasn't confident in the response it generated"

export const DATE_FEATURE_AVAILABLE = new Date(
    '2024-06-12 13:51:15.357000+00:00',
)

export const DRAFT_MESSAGE_TAG = 'data-ai-agent-draft-message'

export const TRIAL_MESSAGE_TAG = 'data-ai-agent-trial-message'

export const BANNER_TYPE = {
    QA_FAILED: 'qa_failed',
    TRIAL: 'trial',
    THUMBS_UP_AND_DOWN: 'thumbs_up_and_down',
    THUMBS_UP_IMPROVE_RESPONSE: 'thumbs_up_improve_response',
    SEND_FEEDBACK: 'send_feedback',
}

export const SAMPLE_RATE = 0.1

export const SIMPLIFIED_RESOURCE_LABELS: Record<string, string> = {
    soft_action: 'Actions::Soft action::',
    action: 'Actions::',
    hard_action: 'Actions::Hard action::',
    guidance: 'Guidance::',
    article: 'Help Center articles::',
    external_snippet: 'Public URLs::',
    macro: 'Macros::',
    file_external_snippet: 'External files::',
    store_website: 'Store website questions::',
}

export const KNOWLEDGE_SOURCE_TYPE: Record<
    string,
    { icon: IconName; label: string }
> = {
    action: { icon: 'media-play-circle', label: 'Action' },
    guidance: { icon: 'nav-map', label: 'Guidance' },
    article: { icon: 'file-document', label: 'Help Center article' },
    website: { icon: 'nav-globe', label: 'Store website' },
    macro: { icon: 'zap', label: 'Macro' },
    link: { icon: 'link-horizontal', label: 'URL' },
    external_snippet: { icon: 'paperclip-attachment', label: 'Document' },
    order: { icon: 'vendor-shopify-colored', label: 'Order' },
    product: { icon: 'vendor-shopify-colored', label: 'Product' },
}

export type KnowledgeSourceType = keyof typeof KNOWLEDGE_SOURCE_TYPE

export const SIMPLIFIED_TO_DEFAULT_KNOWLEDGE_SOURCE_ICON_MAP: Record<
    string,
    KnowledgeSourceType
> = {
    [AiAgentKnowledgeResourceTypeEnum.ACTION]: 'action',
    [AiAgentKnowledgeResourceTypeEnum.ARTICLE]: 'article',
    [AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET]: 'link',
    [AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET]:
        'external_snippet',
    [AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET]:
        'website',
    [AiAgentKnowledgeResourceTypeEnum.GUIDANCE]: 'guidance',
}
