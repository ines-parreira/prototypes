import React, {useRef} from 'react'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import useAppSelector from 'hooks/useAppSelector'
import {getViewLanguage} from 'state/ui/helpCenter'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import {useGetAIArticles} from '../../queries'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import LibrarySkeleton from './components/AIArticlesLibrarySkeleton/AIArticlesLibrarySkeleton'
import AIArticlesLibraryList from './components/AIArticlesLibraryList'

import AIArticlesLibraryPreview from './components/AIArticlesLibraryPreview'
import {useHelpCenterAIArticlesLibrary} from './hooks/useHelpCenterAIArticlesLibrary'
import AIArticleArchiveModal, {
    AIArticleArchiveModalHandle,
} from './components/AIArticleArchiveModal/AIArticleArchiveModal'

import css from './AIArticlesLibraryView.less'

const AIArticlesLibraryView = () => {
    const helpCenter = useCurrentHelpCenter()
    const locale = useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const archiveModal = useRef<AIArticleArchiveModalHandle>(null)
    const {data: fetchedArticles, isLoading} = useGetAIArticles(
        helpCenter.id,
        locale,
        {
            refetchOnWindowFocus: false,
        }
    )
    const {
        articles,
        counters,
        selectedArticle,
        setSelectedArticle,
        selectedArticleType,
        setSelectedArticleType,
        showLinkToArticleTemplates,
    } = useHelpCenterAIArticlesLibrary(fetchedArticles)

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
                            />
                            <AIArticlesLibraryPreview />
                        </div>
                    )}
                </div>
            </HelpCenterPageWrapper>
            <AIArticleArchiveModal ref={archiveModal} onArchive={() => ({})} />
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
