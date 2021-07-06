import React, {MouseEvent} from 'react'
import {Button, ListGroupItem} from 'reactstrap'

import GearIcon from '../../../../../../img/icons/gear.svg'
import {HelpCenterArticle} from '../../../../../models/helpCenter/types'

import css from './HelpCenterArticleListItem.less'

type Props = {
    item: HelpCenterArticle
    onClick: (article: HelpCenterArticle) => void
    onClickSettings: (article: HelpCenterArticle) => void
}

export const HelpCenterArticleListItem = ({
    item,
    onClick,
    onClickSettings,
}: Props) => {
    const clickOnSettings = (event: MouseEvent) => {
        event.stopPropagation()
        onClickSettings(item)
    }

    return (
        <ListGroupItem
            onClick={() => onClick(item)}
            className={css.listItem}
            aria-label="open article"
        >
            <div className={css.articleTitle}>{item.translation?.title}</div>
            <div>
                <Button
                    aria-label="open article settings"
                    onClick={clickOnSettings}
                    className={css.iconBtn}
                >
                    <img alt="gear icon" src={GearIcon} />
                </Button>
            </div>
        </ListGroupItem>
    )
}

export default HelpCenterArticleListItem
