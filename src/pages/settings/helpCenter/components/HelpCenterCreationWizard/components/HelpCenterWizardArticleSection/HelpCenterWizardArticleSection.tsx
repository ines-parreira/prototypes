import React from 'react'

import classNames from 'classnames'
import CheckBox from 'pages/common/forms/CheckBox'
import IconButton from 'pages/common/components/button/IconButton'
import {HelpCenterArticleItem} from 'models/helpCenter/types'
import Tooltip from 'pages/common/components/Tooltip'
import {ARTICLE_TEMPLATE_CATEGORIES} from '../../../CategoriesView/components/ArticleTemplateCard/constants'

import css from './HelpCenterWizardArticleSection.less'

type Props = {
    articles: HelpCenterArticleItem[]
    category: string
    onEdit: (key: string) => void
    onSelect: (key: string) => void
}

const ArticleSection: React.FC<Props> = ({
    category,
    articles,
    onEdit,
    onSelect,
}) => {
    const headerData = ARTICLE_TEMPLATE_CATEGORIES[category]
    const tooltipId = `tooltip-${category}`

    return (
        <div className={css.articleSection}>
            <div className={css.articleCategory}>
                {headerData?.icon && (
                    <i
                        className={classNames('material-icons', css.icon)}
                        style={{color: headerData.icon.color}}
                    >
                        {headerData.icon.name}
                    </i>
                )}
                {headerData?.label}
                {headerData?.tooltip && (
                    <>
                        <i
                            className={classNames(
                                'material-icons',
                                css.infoIcon
                            )}
                            id={tooltipId}
                        >
                            info_outline
                        </i>
                        <Tooltip
                            placement="top-start"
                            target={tooltipId}
                            trigger={['hover']}
                            autohide={false}
                        >
                            <div className={css.tooltipContainer}>
                                {headerData.tooltip}
                            </div>
                        </Tooltip>
                    </>
                )}
            </div>
            <div className={css.articleDelimiter} />
            {articles.map((item) => (
                <div key={item.key}>
                    <div className={css.article}>
                        <CheckBox
                            className={css.articleCheckbox}
                            value={item.key}
                            isChecked={item.isSelected}
                            onChange={() => onSelect(item.key)}
                        />
                        <div
                            className={css.articleCheckboxContent}
                            onClick={() => {
                                onEdit(item.key)
                            }}
                            tabIndex={0}
                            role="button"
                        >
                            <span>{item.title}</span>
                            <IconButton
                                className={css.articleEditButton}
                                fillStyle="ghost"
                                size="small"
                                onClick={() => onEdit(item.key)}
                            >
                                edit
                            </IconButton>
                        </div>
                    </div>
                    <div className={css.articleDelimiter} />
                </div>
            ))}
        </div>
    )
}

export default ArticleSection
