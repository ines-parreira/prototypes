import React, {useState, useEffect} from 'react'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import LibrarySkeleton from './components/AIArticlesLibrarySkeleton/AIArticlesLibrarySkeleton'
import AIArticlesLibraryList from './components/AIArticlesLibraryList'

import css from './AIArticlesLibraryView.less'
import AIArticlesLibraryPreview from './components/AIArticlesLibraryPreview'

const AILibraryComponent = () => {
    const helpCenter = useCurrentHelpCenter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    return (
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
    )
}

const AILibraryView = () => (
    <ErrorBoundary
        sentryTags={{
            section: 'help-center-ai-library',
            team: 'automate-obs',
        }}
    >
        <AILibraryComponent />
    </ErrorBoundary>
)

export default AILibraryView
