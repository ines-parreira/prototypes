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
    withLabel?: boolean
}

const KnowledgeSourceIcon = ({
    type,
    withLabel = false,
}: KnowledgeSourceIconProps) => {
    if (!KNOWLEDGE_SOURCE_TYPE[type]) {
        return null
    }

    if (KNOWLEDGE_SOURCE_TYPE[type].icon === KnowledgeSourceTypeIcon.shopify) {
        return (
            <>
                <img
                    className={css.shopifyLogo}
                    alt="shopify logo"
                    src={shopifyLogo}
                />
                {withLabel && <span>{KNOWLEDGE_SOURCE_TYPE[type].label}</span>}
            </>
        )
    }

    return (
        <>
            <Badge className={css.badge}>
                <i className="material-icons">
                    {KNOWLEDGE_SOURCE_TYPE[type].icon}
                </i>
            </Badge>
            {withLabel && <span>{KNOWLEDGE_SOURCE_TYPE[type].label}</span>}
        </>
    )
}

export default KnowledgeSourceIcon
