import React, { useCallback, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    helpCenterArticleKeys,
    helpCenterKeys,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'
import { ArticleTemplateType } from 'models/helpCenter/types'
import ArticleEditor from 'pages/settings/helpCenter/components/HelpCenterCreationWizard/components/HelpCenterWizardArticleEditor/HelpCenterWizardArticleEditor'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {
    getArticleUrl,
    getHelpCenterDomain,
    slugify,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import type { Components } from '../../../../rest_api/help_center_api/client.generated'

import css from './PreviewArticle.less'

interface Props {
    articleData: Components.Schemas.ArticleWithLocalTranslation
    helpCenter: HelpCenter
}

export default function PreviewHeader({ articleData, helpCenter }: Props) {
    const {
        mutateAsync: updateArticleTranslationMutateAsync,
        isLoading: isUpdateArticleTranslationLoading,
    } = useUpdateArticleTranslation()
    const [isEditorReady, setIsEditorReady] = useState(false)

    const queryClient = useQueryClient()

    const dispatch = useAppDispatch()

    const { setEditModal } = useEditionManager()

    const handleEditorReady = useCallback(() => {
        setIsEditorReady(true)
    }, [setIsEditorReady])

    const handleEditorSave = useCallback(
        async (title: string, content: string) => {
            try {
                await updateArticleTranslationMutateAsync([
                    undefined,
                    {
                        help_center_id: articleData.help_center_id,
                        article_id: articleData.id,
                        locale: articleData.translation.locale,
                    },
                    {
                        title,
                        content,
                        slug: slugify(title),
                        is_current: true,
                    },
                ])
            } catch {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Error updating article.',
                    }),
                )
                return
            }

            setEditModal((prevState) => ({
                ...prevState,
                isOpened: false,
            }))

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Article updated successfullly.',
                }),
            )

            void queryClient.invalidateQueries({
                queryKey: helpCenterArticleKeys(
                    articleData.help_center_id,
                    articleData.id,
                    articleData.translation.locale,
                ),
            })
            void queryClient.invalidateQueries({
                queryKey: helpCenterKeys.detail(articleData.help_center_id),
            })
        },
        [
            articleData,
            dispatch,
            queryClient,
            setEditModal,
            updateArticleTranslationMutateAsync,
        ],
    )

    const handleEditorClose = useCallback(() => {
        setEditModal((prevState) => ({
            ...prevState,
            isOpened: false,
        }))
    }, [setEditModal])

    const articleURL = useMemo(() => {
        return getArticleUrl({
            domain: getHelpCenterDomain(helpCenter),
            locale: articleData.translation.locale,
            slug: articleData.translation.slug,
            articleId: articleData.id,
            unlistedId: articleData.translation.article_unlisted_id,
            isUnlisted:
                articleData.translation.visibility_status === 'UNLISTED',
        })
    }, [articleData, helpCenter])

    return (
        <div className={css.container}>
            <div className={css.articleContainer}>
                <div className={css.infoContainer}>
                    <div className={css.titleContainer}>
                        <div className={css.subTitle}>Article preview</div>
                        <div className={css.title}>
                            {articleData?.translation.title}
                        </div>
                    </div>

                    <div className={css.editContainer}>
                        {isEditorReady && (
                            <i
                                onClick={() =>
                                    setEditModal({
                                        isOpened: true,
                                        view: null,
                                    })
                                }
                                className={'material-icons'}
                            >
                                edit
                            </i>
                        )}
                        {articleURL && (
                            <i
                                onClick={() =>
                                    window.open(articleURL, '_blank')
                                }
                                className={'material-icons'}
                            >
                                open_in_new
                            </i>
                        )}
                    </div>
                </div>
                <div
                    className={css.contentContainer}
                    dangerouslySetInnerHTML={{
                        __html: articleData?.translation.content,
                    }}
                ></div>
            </div>

            {helpCenter && (
                <ArticleEditor
                    article={{
                        title: articleData.translation?.title,
                        content: articleData.translation?.content,
                        slug: articleData.translation?.slug,
                        id: articleData.translation?.article_id,
                        shouldCreateTranslation: false,
                        key: articleData.translation?.article_id.toString(),
                        type: ArticleTemplateType.Template,
                        isSelected: true,
                        isTouched: true,
                    }}
                    locale={articleData.translation.locale}
                    isLoading={isUpdateArticleTranslationLoading}
                    onEditorSave={handleEditorSave}
                    onEditorClose={handleEditorClose}
                    onEditorReady={handleEditorReady}
                />
            )}
        </div>
    )
}
