import React, { useEffect, useState } from 'react'

import classNames from 'classnames'
import copy from 'copy-to-clipboard'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type {
    ArticleTranslationSeoMeta,
    CreateArticleTranslationDto,
    CustomerVisibility,
    LocalArticleTranslation,
} from 'models/helpCenter/types'
import AutoPopulateInput from 'pages/common/forms/AutoPopulateInput/AutoPopulateInput'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import InputField from 'pages/common/forms/input/InputField'
import TextArea from 'pages/common/forms/TextArea'
import settingsCss from 'pages/settings/settings.less'
import { getCategories } from 'state/entities/helpCenter/categories'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { HELP_CENTER_TITLE_MAX_LENGTH } from '../../constants'
import { useEditionManager } from '../../providers/EditionManagerContext'
import {
    getAbsoluteUrl,
    getArticleUrl,
    slugify,
} from '../../utils/helpCenter.utils'
import { isOneOfParentsUnlisted } from '../HelpCenterCategoryEdit/utils'
import { SearchEnginePreview } from '../SearchEnginePreview'
import SelectCustomerVisibility from '../SelectVisibilityStatus/SelectVisibilityStatus'
import ArticleCategorySelect from './ArticleCategorySelect'
import { HelpCenterArticleAIAgentBanner } from './HelpCenterArticleAIAgentBanner'

import css from './HelpCenterEditAdvancedArticleForm.less'

type Props = {
    articleId?: number
    categoryId?: number | null
    translation: CreateArticleTranslationDto | LocalArticleTranslation
    domain: string
    shopName: string | null
    onChange: (
        translation: CreateArticleTranslationDto | LocalArticleTranslation,
    ) => void
    onCategoryChange: (categoryId: number | null) => void
}

export const HelpCenterEditAdvancedArticleForm = ({
    articleId,
    categoryId,
    translation,
    domain,
    shopName,
    onChange,
    onCategoryChange,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()

    const { selectedCategoryId } = useEditionManager()

    const categories = useAppSelector(getCategories)
    const [showNotification, setShowNotification] = useState(false)
    const [isParentUnlisted, setIsParentUnlisted] = useState(false)

    const slugPrefix = getAbsoluteUrl({ domain, locale: translation.locale })
    const slugSuffix = articleId ? `-${articleId.toString()}` : ''

    useEffect(() => {
        setIsParentUnlisted(
            isOneOfParentsUnlisted(categories, selectedCategoryId),
        )
    }, [selectedCategoryId, categories])

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
        onChange({
            ...translation,
            category_id: selectedCategoryId,
        })
        setShowNotification(
            isOneOfParentsUnlisted(categories, selectedCategoryId),
        )
    }

    const copyURL = () => {
        const { locale, slug } = translation
        const isUnlisted =
            isOneOfParentsUnlisted(categories, selectedCategoryId) ||
            translation.customer_visibility === 'UNLISTED'

        const unlistedId =
            'article_unlisted_id' in translation
                ? translation.article_unlisted_id
                : ''

        copy(
            getArticleUrl({
                domain,
                locale,
                slug,
                articleId,
                unlistedId,
                isUnlisted,
            }),
        )

        void dispatch(
            notify({
                message: 'Link copied with success',
                status: NotificationStatus.Success,
            }),
        )
    }

    return (
        <div className={css.wrapper}>
            {articleId && (
                <div className={css.banner}>
                    <HelpCenterArticleAIAgentBanner
                        articleId={articleId}
                        shopName={shopName}
                    />
                </div>
            )}
            <InputField
                isRequired
                type="text"
                name="title"
                label="Title"
                value={translation.title}
                onChange={onEditArticle('title')}
                maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                className={classNames(settingsCss.mb16, css.titleInput)}
            />
            <div className={css.split}>
                <ArticleCategorySelect
                    locale={translation.locale}
                    categoryId={categoryId ?? null}
                    onChange={onChangeCategory}
                />
                <div>
                    <SelectCustomerVisibility
                        onChange={(status: CustomerVisibility) => {
                            onChange({
                                ...translation,
                                customer_visibility: status,
                            })
                        }}
                        status={translation.customer_visibility}
                        showNotification={showNotification}
                        setShowNotification={setShowNotification}
                        isParentUnlisted={isParentUnlisted}
                        type="article"
                    />
                </div>
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
                value={translation.excerpt}
                onChange={onEditArticle('excerpt')}
                rows={2}
                name="excerpt"
                label="Excerpt"
                caption="A short summary displayed below the title of your article."
                maxLength={HELP_CENTER_TITLE_MAX_LENGTH}
                className={settingsCss.mb16}
            />
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
                baseUrl={getAbsoluteUrl({ domain }, false)}
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
