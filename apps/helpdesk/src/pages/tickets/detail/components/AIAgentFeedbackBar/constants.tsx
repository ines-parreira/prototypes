import { AiAgentKnowledgeResourceTypeEnum } from './types'

export const RESOURCE_ICONS: Record<string, JSX.Element> = {
    'Soft action': <i className="material-icons">play_circle</i>,
    'Hard action': <i className="material-icons">play_circle</i>,
    'Help Center articles': <i className="material-icons">article</i>,
    Macros: <i className="material-icons">article</i>,
    'External websites': <i className="material-icons">article</i>,
    'External files': <i className="material-icons">article</i>,
    Guidance: <i className="material-icons">map</i>,
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

export enum KnowledgeSourceTypeIcon {
    webhook = 'webhook',
    map = 'map',
    article = 'article',
    language = 'language',
    bolt = 'bolt',
    link = 'link',
    attach_file = 'attach_file',
    shopify = 'shopify',
}

export const KNOWLEDGE_SOURCE_TYPE = {
    action: { icon: KnowledgeSourceTypeIcon.webhook, label: 'Action' },
    guidance: { icon: KnowledgeSourceTypeIcon.map, label: 'Guidance' },
    article: {
        icon: KnowledgeSourceTypeIcon.article,
        label: 'Help Center article',
    },
    website: { icon: KnowledgeSourceTypeIcon.language, label: 'Store website' },
    macro: { icon: KnowledgeSourceTypeIcon.bolt, label: 'Macro' },
    link: { icon: KnowledgeSourceTypeIcon.link, label: 'Public URL' },
    external_snippet: {
        icon: KnowledgeSourceTypeIcon.attach_file,
        label: 'External file',
    },
    order: { icon: KnowledgeSourceTypeIcon.shopify, label: 'Order' },
    product: { icon: KnowledgeSourceTypeIcon.shopify, label: 'Product' },
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
