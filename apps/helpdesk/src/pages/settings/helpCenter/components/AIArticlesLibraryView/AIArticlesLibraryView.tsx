import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory } from 'react-router-dom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppSelector from 'hooks/useAppSelector'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { getViewLanguage } from 'state/ui/helpCenter'

import { HELP_CENTER_DEFAULT_LOCALE } from '../../constants'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import AIArticleArchiveModal from './components/AIArticleArchiveModal/AIArticleArchiveModal'
import ArticleEditor from './components/AIArticlesLibraryArticleEditor/AIArticlesLibraryArticleEditor'
import AIArticlesLibraryList from './components/AIArticlesLibraryList'
import AIArticlesLibraryPreview from './components/AIArticlesLibraryPreview'
import LibrarySkeleton from './components/AIArticlesLibrarySkeleton/AIArticlesLibrarySkeleton'
import useAILibraryActions from './hooks/useAILibraryActions'
import { useHelpCenterAIArticlesLibrary } from './hooks/useHelpCenterAIArticlesLibrary'

import css from './AIArticlesLibraryView.less'

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
        hasStoreConnectionOrDefaultStore,
        showLinkToConnectEmailToStore,
        markArticleAsReviewed,
    } = useHelpCenterAIArticlesLibrary(
        helpCenter.id,
        locale,
        helpCenter.shop_name,
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
                                helpCenterId={helpCenter.id}
                                hasStoreConnection={
                                    hasStoreConnectionOrDefaultStore
                                }
                                showLinkToConnectEmailToStore={
                                    !!showLinkToConnectEmailToStore
                                }
                            />
                            <AIArticlesLibraryPreview
                                onArchive={onStartArchive}
                                onPublish={onPublish}
                                onEdit={onEdit}
                                article={
                                    !hasStoreConnectionOrDefaultStore ||
                                    showLinkToConnectEmailToStore
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
            team: SentryTeam.CONVAI_KNOWLEDGE,
        }}
    >
        <AIArticlesLibraryView />
    </ErrorBoundary>
)

export default AIArticlesLibraryViewWithErrorBoundary
