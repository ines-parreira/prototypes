import { Fragment } from 'react'

import { Badge, LoadingSpinner } from '@gorgias/merchant-ui-kit'

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
                    <Badge className={css.badge} type={'light-success'}>
                        <Fragment key=".0">
                            <i className="material-icons">check_circle</i>
                            <div>Ready</div>
                        </Fragment>
                    </Badge>
                ) : (
                    <Badge className={css.badge} type={'light-grey'}>
                        <Fragment key=".0">
                            <LoadingSpinner
                                className={css.spinner}
                                size="small"
                                data-testid="loading-spinner"
                            />
                            <div>In Process</div>
                        </Fragment>
                    </Badge>
                )}
            </div>
        </div>
    )
}
