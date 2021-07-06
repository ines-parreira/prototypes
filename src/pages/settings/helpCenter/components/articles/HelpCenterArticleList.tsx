import React from 'react'
import {ListGroup} from 'reactstrap'

import {HelpCenterArticle} from '../../../../../models/helpCenter/types'

import HelpCenterArticleListItem from './HelpCenterArticleListItem'
import css from './HelpCenterArticleList.less'

type Props = {
    label: string
    list: HelpCenterArticle[]
    onClick: (article: HelpCenterArticle) => void
    onClickSettings: (article: HelpCenterArticle) => void
}

export const HelpCenterArticleList = ({
    label,
    list,
    onClick,
    onClickSettings,
}: Props) => {
    return (
        <div className={css.wrapper}>
            <h6 className={css.label}>{label}</h6>
            <ListGroup>
                {list.map((item) => (
                    <HelpCenterArticleListItem
                        key={item.id}
                        item={item}
                        onClick={onClick}
                        onClickSettings={onClickSettings}
                    />
                ))}
            </ListGroup>
        </div>
    )
}

export default HelpCenterArticleList
