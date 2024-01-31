import React, {useState} from 'react'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'
import {ArticleTemplate} from 'models/helpCenter/types'
import {ArticleTemplateModal} from '../ArticleTemplateModal/ArticleTemplateModal'

import css from './ArticleTemplateCard.less'
import {ARTICLE_TEMPLATE_CATEGORIES} from './constants'

type Props = {
    template: ArticleTemplate
    canUpdateArticle: boolean | null
    onCreateArticleWithTemplate: () => void
}

const ArticleTemplateCard = ({
    template,
    canUpdateArticle,
    onCreateArticleWithTemplate,
}: Props) => {
    const [isModalOpen, setModalOpen] = useState(false)

    const handleClick = () => {
        setModalOpen(true)
    }
    const handleModalClose = () => {
        setModalOpen(false)
    }

    const style = {order: Math.floor(-1 * template.score * Math.pow(10, 5))} // we multiply by -1 to reverse the order
    const categoryStyle = ARTICLE_TEMPLATE_CATEGORIES[template.category].style
    const categoryLabel = ARTICLE_TEMPLATE_CATEGORIES[template.category].label

    return (
        <>
            <div className={css.container} onClick={handleClick} style={style}>
                <div className={css.header}>
                    <div
                        className={classNames(css.label)}
                        style={categoryStyle}
                    >
                        {categoryLabel}
                    </div>
                    <Button size="small" intent="secondary">
                        Preview
                    </Button>
                </div>
                <div>
                    <div className={css.title}>{template.title}</div>
                    <div className={css.description}>{template.excerpt}</div>
                </div>
            </div>
            <ArticleTemplateModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                template={template}
                canUpdateArticle={canUpdateArticle}
                onCreateArticleWithTemplate={onCreateArticleWithTemplate}
            />
        </>
    )
}

export default ArticleTemplateCard
