import { Badge } from '@gorgias/merchant-ui-kit'

import shopifyLogo from 'assets/img/icons/shopifyStore.svg'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import {
    KNOWLEDGE_SOURCE_TYPE,
    KnowledgeSourceType,
    KnowledgeSourceTypeIcon,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'

type KnowledgeSourceIconProps = {
    type: KnowledgeSourceType
}

const KnowledgeSourceIcon = ({ type }: KnowledgeSourceIconProps) => {
    if (!KNOWLEDGE_SOURCE_TYPE[type]) {
        return null
    }

    if (KNOWLEDGE_SOURCE_TYPE[type].icon === KnowledgeSourceTypeIcon.shopify) {
        return (
            <img
                className={css.shopifyLogo}
                alt="shopify logo"
                src={shopifyLogo}
            />
        )
    }

    return (
        <Badge className={css.badge}>
            <i className="material-icons">{KNOWLEDGE_SOURCE_TYPE[type].icon}</i>
        </Badge>
    )
}

export default KnowledgeSourceIcon
