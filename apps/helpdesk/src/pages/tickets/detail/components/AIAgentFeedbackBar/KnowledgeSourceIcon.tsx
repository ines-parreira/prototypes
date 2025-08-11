import cs from 'classnames'

import { Badge } from '@gorgias/axiom'

import shopifyLogo from 'assets/img/icons/shopifyStore.svg'
import {
    KNOWLEDGE_SOURCE_TYPE,
    KnowledgeSourceType,
    KnowledgeSourceTypeIcon,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon.less'

type KnowledgeSourceIconProps = {
    type: KnowledgeSourceType
    withLabel?: boolean
    badgeIconClassname?: string
}

const KnowledgeSourceIcon = ({
    type,
    withLabel = false,
    badgeIconClassname,
}: KnowledgeSourceIconProps) => {
    if (!KNOWLEDGE_SOURCE_TYPE[type]) {
        return null
    }

    if (KNOWLEDGE_SOURCE_TYPE[type].icon === KnowledgeSourceTypeIcon.shopify) {
        return (
            <>
                <img
                    className={css.imageLogo}
                    alt="shopify logo"
                    src={shopifyLogo}
                />
                {withLabel && <span>{KNOWLEDGE_SOURCE_TYPE[type].label}</span>}
            </>
        )
    }

    return (
        <>
            <Badge className={cs(css.badge, badgeIconClassname)}>
                <i className="material-icons">
                    {KNOWLEDGE_SOURCE_TYPE[type].icon}
                </i>
            </Badge>
            {withLabel && <span>{KNOWLEDGE_SOURCE_TYPE[type].label}</span>}
        </>
    )
}

export default KnowledgeSourceIcon
