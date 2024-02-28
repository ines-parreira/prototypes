import React, {useState, useEffect, useRef} from 'react'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import LibrarySkeleton from './components/AIArticlesLibrarySkeleton/AIArticlesLibrarySkeleton'
import AIArticlesLibraryList from './components/AIArticlesLibraryList'

import css from './AIArticlesLibraryView.less'
import AIArticlesLibraryPreview from './components/AIArticlesLibraryPreview'
import AIArticleArchiveModal, {
    AIArticleArchiveModalHandle,
} from './components/AIArticleArchiveModal/AIArticleArchiveModal'

const AIArticlesLibraryView = () => {
    const helpCenter = useCurrentHelpCenter()
    const [isLoading, setIsLoading] = useState(true)
    const archiveModal = useRef<AIArticleArchiveModalHandle>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

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
                            <AIArticlesLibraryList />
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
