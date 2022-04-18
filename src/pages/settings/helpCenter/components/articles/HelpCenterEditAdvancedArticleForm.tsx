import React from 'react'
import copy from 'copy-to-clipboard'

import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import InputField from 'pages/common/forms/input/InputField'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    ArticleTranslationSeoMeta,
    CreateArticleTranslationDto,
    LocalArticleTranslation,
} from 'models/helpCenter/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import AutoPopulateInput from 'pages/common/forms/AutoPopulateInput/AutoPopulateInput'
import Label from 'pages/common/forms/Label/Label'
import TextArea from 'pages/common/forms/TextArea'
import settingsCss from 'pages/settings/settings.less'
import {HELP_CENTER_TITLE_MAX_LENGTH} from '../../constants'
import {
    getAbsoluteUrl,
    getArticleUrl,
    slugify,
} from '../../utils/helpCenter.utils'
import {SearchEnginePreview} from '../SearchEnginePreview'
import ArticleCategorySelect from './ArticleCategorySelect'

import css from './HelpCenterEditAdvancedArticleForm.less'

type Props = {
    articleId?: number
    categoryId?: number | null
    helpCenterId: number
    translation: CreateArticleTranslationDto | LocalArticleTranslation
    domain: string
    onChange: (
        translation: CreateArticleTranslationDto | LocalArticleTranslation
    ) => void
    onCategoryChange: (categoryId: number | null) => void
}

export const HelpCenterEditAdvancedArticleForm = ({
    articleId,
    categoryId,
    helpCenterId,
    translation,
    domain,
    onChange,
    onCategoryChange,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()

    const slugPrefix = getAbsoluteUrl({domain, locale: translation.locale})
    const slugSuffix = articleId ? `-${articleId.toString()}` : ''

    const onEditArticle =
        (editKey: keyof CreateArticleTranslationDto) => (value: string) => {
            if (editKey === 'title') {
                onChange({
                    ...translation,
                    [editKey]: value,
                    slug: slugify(value),
                })
                return
            }

            onChange({
                ...translation,
                [editKey]: editKey === 'slug' ? slugify(value) : value,
            })
        }

    const onEditSeoMeta =
        (editKey: keyof ArticleTranslationSeoMeta) =>
        (value: string | null) => {
            onChange({
                ...translation,
                seo_meta: {
                    ...translation.seo_meta,
                    [editKey]: value,
                },
            })
        }

    const onChangeCategory = (selectedCategoryId: number | null) => {
        onCategoryChange(selectedCategoryId)
    }

    const copyURL = () => {
        const {locale, slug} = translation

        copy(getArticleUrl({domain, locale, slug, articleId}))

        void dispatch(
            notify({
                message: 'Link copied with success',
                status: NotificationStatus.Success,
            })
        )
    }

    return (
        <div className={css.wrapper}>
            <InputField
                isRequired
                type="text"
                name="title"
                label="Title"
                value={translation.title}
                onChange={onEditArticle('title')}
                maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                className={settingsCss.mb16}
            />
            <div className={css.categorySelect}>
                <Label>Category</Label>
                <ArticleCategorySelect
                    locale={translation.locale}
                    helpCenterId={helpCenterId}
                    categoryId={categoryId ?? null}
                    onChange={onChangeCategory}
                />
            </div>
            <div className={css.inputWrapper}>
                <DEPRECATED_InputField
                    required
                    type="text"
                    name="slug"
                    label="Slug"
                    leftAddon={slugPrefix}
                    rightAddon={slugSuffix}
                    value={translation.slug}
                    onChange={onEditArticle('slug')}
                    help="This is the URL link for your article."
                />
                {articleId && (
                    <button
                        className={css.copyButton}
                        type="button"
                        onClick={copyURL}
                    >
                        Copy URL
                        <i className="material-icons">content_copy</i>
                    </button>
                )}
            </div>
            <TextArea
                onChange={onEditArticle('excerpt')}
                rows={2}
                name="excerpt"
                label="Excerpt"
                caption="A short summary displayed below the title of your article."
                maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                className={settingsCss.mb16}
            >
                {translation.excerpt}
            </TextArea>
            <AutoPopulateInput
                type="text"
                name="seoTitle"
                label="Meta Title"
                value={translation.seo_meta.title}
                onChange={onEditSeoMeta('title')}
                populateLabel="Use the same as Title"
                populateValue={translation.title}
                help="SEO Title tag is how your article is going to be displayed in search engines."
                required
            />
            <AutoPopulateInput
                type="textarea"
                name="seoDescription"
                label="Meta Description"
                value={translation.seo_meta.description}
                onChange={onEditSeoMeta('description')}
                populateLabel="Use the same as Excerpt"
                populateValue={translation.excerpt}
                help="Article description is displayed in search engines to help people find it."
                rows="2"
                required
            />
            <SearchEnginePreview
                baseUrl={getAbsoluteUrl({domain}, false)}
                title={translation.seo_meta.title ?? translation.title}
                description={
                    translation.seo_meta.description ?? translation.excerpt
                }
                urlItems={[`${translation.slug}${slugSuffix}`]}
                help="This is a preview of how your article is going to look like in search engines (e.g. Google, Duckduckgo, Bing...)"
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
