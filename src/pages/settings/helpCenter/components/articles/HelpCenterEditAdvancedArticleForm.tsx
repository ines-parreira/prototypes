import React from 'react'

import InputField from '../../../../common/forms/InputField.js'
import {HelpCenterArticleTranslation} from '../../../../../models/helpCenter/types'

import {HELP_CENTER_DOMAIN} from '../../constants'

import css from './HelpCenterEditAdvancedArticleForm.less'

type Props = {
    articleId?: number
    translation: HelpCenterArticleTranslation
    subdomain: string
    onChange: (translation: HelpCenterArticleTranslation) => void
}

export const HelpCenterEditAdvancedArticleForm = ({
    articleId,
    translation,
    subdomain,
    onChange,
}: Props) => {
    const onEditArticle = (editKey: string) => (newValue: string) => {
        onChange({
            ...translation,
            [editKey]: newValue,
        })
    }

    return (
        <div className={css.wrapper}>
            <InputField
                required
                type="text"
                name="title"
                label="Title"
                value={translation.title}
                onChange={onEditArticle('title')}
            />
            <InputField
                required
                type="text"
                name="slug"
                label="Slug"
                leftAddon={`https://${subdomain}.${HELP_CENTER_DOMAIN}/`}
                value={translation.slug}
                onChange={onEditArticle('slug')}
            />
            <InputField
                required
                type="textarea"
                rows="2"
                name="excerpt"
                label="Description"
                value={translation.excerpt}
                onChange={onEditArticle('excerpt')}
            />
            {articleId && (
                <i
                    className={css.articleIDHint}
                >{`Article id: ${articleId}`}</i>
            )}
        </div>
    )
}

export default HelpCenterEditAdvancedArticleForm
