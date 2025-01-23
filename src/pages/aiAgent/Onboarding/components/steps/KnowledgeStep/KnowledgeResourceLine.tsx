import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import {KnowledgeSourceType} from '../types'
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
                    <Badge type={ColorType.LightSuccess}>
                        <React.Fragment key=".0">
                            <i className="material-icons">check_circle</i>
                            <div>Ready</div>
                        </React.Fragment>
                    </Badge>
                ) : (
                    <Badge type={ColorType.LightGrey}>
                        <React.Fragment key=".0">
                            <LoadingSpinner
                                className={css.spinner}
                                size="small"
                                data-testid="loading-spinner"
                            />
                            <div>In Process</div>
                        </React.Fragment>
                    </Badge>
                )}
            </div>
        </div>
    )
}
