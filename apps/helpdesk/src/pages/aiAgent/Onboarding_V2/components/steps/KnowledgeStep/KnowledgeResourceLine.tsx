import { Icon, Tag } from '@gorgias/axiom'

import { KnowledgeSourceType } from '../types'
import ChatIcon from './icons/ChatIcon'
import LinkIcon from './icons/LinkIcon'
import StoreIcon from './icons/StoreIcon'

import css from './KnowledgeResourceLine.less'

type Props = {
    name: string
    type: KnowledgeSourceType
    isReady: boolean
}

const getIcon = (type: KnowledgeSourceType) => {
    switch (type) {
        case KnowledgeSourceType.DOMAIN:
            return <LinkIcon />
        case KnowledgeSourceType.SHOPIFY:
            return <StoreIcon />
        case KnowledgeSourceType.HELP_CENTER:
            return <ChatIcon />
        default:
            return <LinkIcon />
    }
}

export const KnowledgeResourceLine: React.FC<Props> = ({
    name,
    type,
    isReady,
}) => {
    return (
        <div className={css.line}>
            <div className={css.icon}>{getIcon(type)}</div>
            <div className={css.resource}>{name}</div>
            <div className={css.status}>
                {isReady ? (
                    <Tag className={css.badge} color="green">
                        <i className="material-icons">check_circle</i>
                        <div>Ready</div>
                    </Tag>
                ) : (
                    <Tag className={css.badge} color="grey">
                        <div className={css.spinner}>
                            <Icon
                                name="arrows-reload-alt-1"
                                data-testid="loading-spinner"
                            />
                        </div>
                        <div>In Process</div>
                    </Tag>
                )}
            </div>
        </div>
    )
}
