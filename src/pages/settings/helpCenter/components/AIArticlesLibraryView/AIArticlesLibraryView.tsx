import React from 'react'
import {useHistory} from 'react-router-dom'
import {SegmentEvent, logEvent} from 'common/segment'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import useEffectOnce from 'hooks/useEffectOnce'
import useAppSelector from 'hooks/useAppSelector'
import {getViewLanguage} from 'state/ui/helpCenter'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import LibrarySkeleton from './components/AIArticlesLibrarySkeleton/AIArticlesLibrarySkeleton'
import AIArticlesLibraryList from './components/AIArticlesLibraryList'
import AIArticlesLibraryPreview from './components/AIArticlesLibraryPreview'
import {useHelpCenterAIArticlesLibrary} from './hooks/useHelpCenterAIArticlesLibrary'
import AIArticleArchiveModal from './components/AIArticleArchiveModal/AIArticleArchiveModal'
import ArticleEditor from './components/AIArticlesLibraryArticleEditor/AIArticlesLibraryArticleEditor'

import css from './AIArticlesLibraryView.less'
import useAILibraryActions from './hooks/useAILibraryActions'

const AIArticlesLibraryView = () => {
    const history = useHistory()
    const helpCenter = useCurrentHelpCenter()
    const locale = useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const {
        isLoading,
        articles,
        counters,
        selectedArticle,
        setSelectedArticle,
        selectedArticleType,
        setSelectedArticleType,
        showLinkToArticleTemplates,
        hasEmailToStoreConnection,
        markArticleAsReviewed,
    } = useHelpCenterAIArticlesLibrary(
        helpCenter.id,
        locale,
        helpCenter.shop_name
    )

    const {
        onEditorClose,
        onEdit,
        archiveModal,
        isEditModalOpen,
        onStartArchive,
        onArchive,
        onPublish,
        onEditorSave,
    } = useAILibraryActions(helpCenter, articles, markArticleAsReviewed)

    useEffectOnce(() => {
        logEvent(SegmentEvent.HelpCenterAILibraryViewed, {
            from:
                (history.location.state as Record<string, string>)?.from ?? '',
        })
    })

    return (
        <>
            <HelpCenterPageWrapper
                helpCenter={helpCenter}
                isDirty={false}
                fluidContainer={false}
                pageWrapperClassName={css.pageWrapper}
            >
                <div className={css.wrapper}>
                    {isLoading ? (
                        <LibrarySkeleton />
                    ) : (
                        <div className={css.container}>
                            <AIArticlesLibraryList
                                articles={articles}
                                counters={counters}
                                selectedArticle={selectedArticle}
                                setSelectedArticle={setSelectedArticle}
                                selectedArticleType={selectedArticleType}
                                setSelectedArticleType={setSelectedArticleType}
                                showLinkToArticleTemplates={
                                    showLinkToArticleTemplates
                                }
                                helpCenterId={helpCenter.id}
                                hasEmailToStoreConnection={
                                    !!hasEmailToStoreConnection
                                }
                            />
                            <AIArticlesLibraryPreview
                                onArchive={onStartArchive}
                                onPublish={onPublish}
                                onEdit={onEdit}
                                article={
                                    !hasEmailToStoreConnection ||
                                    showLinkToArticleTemplates
                                        ? undefined
                                        : selectedArticle
                                }
                            />
                        </div>
                    )}
                </div>
            </HelpCenterPageWrapper>
            <AIArticleArchiveModal ref={archiveModal} onArchive={onArchive} />
            <ArticleEditor
                article={selectedArticle}
                locale={locale}
                onEditorSave={onEditorSave}
                onEditorClose={onEditorClose}
                isLoading={isLoading}
                isEditModalOpen={isEditModalOpen}
            />
        </>
    )
}

const AIArticlesLibraryViewWithErrorBoundary = () => (
    <ErrorBoundary
        sentryTags={{
            section: 'help-center-ai-library',
            team: 'automate-obs',
        }}
    >
        <AIArticlesLibraryView />
    </ErrorBoundary>
)

export default AIArticlesLibraryViewWithErrorBoundary
