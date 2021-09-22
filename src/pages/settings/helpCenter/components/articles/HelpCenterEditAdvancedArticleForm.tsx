import React from 'react'
import copy from 'copy-to-clipboard'

import {HelpCenterArticleTranslation} from '../../../../../models/helpCenter/types'
import InputField from '../../../../common/forms/InputField.js'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {HELP_CENTER_DOMAIN} from '../../constants'
import {slugify} from '../../utils/helpCenter.utils'

import css from './HelpCenterEditAdvancedArticleForm.less'

type Props = {
    articleId: number
    translation: HelpCenterArticleTranslation
    subdomain: string
    onChange: (translation: HelpCenterArticleTranslation) => void
}

export const HelpCenterEditAdvancedArticleForm = ({
    articleId,
    translation,
    subdomain,
    onChange,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()

    const slugPrefix = `https://${subdomain}${HELP_CENTER_DOMAIN}/`
    const slugSuffix = `-${articleId}`

    const onEditArticle = (editKey: string) => (newValue: string) => {
        if (editKey === 'title') {
            onChange({
                ...translation,
                [editKey]: newValue,
                slug: slugify(newValue),
            })
            return
        }
        onChange({
            ...translation,
            [editKey]: editKey === 'slug' ? slugify(newValue) : newValue,
        })
    }

    const copyURL = () => {
        copy(`${slugPrefix}${translation.slug}${slugSuffix}`)

        void dispatch(
            notify({
                message: "Successfully copied the article's URL",
                status: NotificationStatus.Success,
            })
        )
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
            <div className={css.inputWrapper}>
                <InputField
                    required
                    type="text"
                    name="slug"
                    label="Slug"
                    leftAddon={slugPrefix}
                    rightAddon={slugSuffix}
                    value={translation.slug}
                    onChange={onEditArticle('slug')}
                    help="This is your article's link."
                />
                <button
                    type="button"
                    onClick={copyURL}
                    className={css.copyButton}
                >
                    Copy URL
                    <i className="material-icons">content_copy</i>
                </button>
            </div>
            <InputField
                type="textarea"
                rows="2"
                name="excerpt"
                label="Description"
                value={translation.excerpt}
                onChange={onEditArticle('excerpt')}
                help="Displayed under the title of this article inside your help center."
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
