import React from 'react'

import CheckBox from 'pages/common/forms/CheckBox'
import IconButton from 'pages/common/components/button/IconButton'
import {
    ArticleTemplateCategory,
    HelpCenterArticleItem,
} from 'models/helpCenter/types'
import {ARTICLE_TEMPLATE_CATEGORIES} from '../../../CategoriesView/components/ArticleTemplateCard/constants'

import css from './HelpCenterWizardArticleSection.less'

type Props = {
    articles: HelpCenterArticleItem[]
    category: ArticleTemplateCategory
    onEdit: (key: string) => void
    onSelect: (key: string) => void
}

const ArticleSection: React.FC<Props> = ({
    category,
    articles,
    onEdit,
    onSelect,
}) => {
    const categoryMetadata = ARTICLE_TEMPLATE_CATEGORIES[category]
    return (
        <div className={css.articleSection}>
            <div className={css.articleCategory}>{categoryMetadata.label}</div>
            <div className={css.articleDelimiter} />
            {articles.map((item) => (
                <div key={item.key}>
                    <div className={css.article}>
                        <CheckBox
                            value={item.key}
                            isChecked={item.isSelected}
                            onChange={() => onSelect(item.key)}
                        >
                            <div className={css.articleCheckboxContent}>
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
                        </CheckBox>
                    </div>
                    <div className={css.articleDelimiter} />
                </div>
            ))}
        </div>
    )
}

export default ArticleSection
