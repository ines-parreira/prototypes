import React from 'react'
import {Container} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import {getViewLanguage, changeViewLanguage} from 'state/ui/helpCenter'
import {validLocaleCode} from 'models/helpCenter/utils'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {HELP_CENTER_DEFAULT_LOCALE} from 'pages/settings/helpCenter/constants'
import {useGetArticleTemplates} from 'pages/settings/helpCenter/queries'
import {ArticleTemplate} from 'models/helpCenter/types'
import {SegmentEvent, logEvent} from 'common/segment'
import useEffectOnce from 'hooks/useEffectOnce'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import ArticleTemplatesBanner from '../ArticleTemplatesBanner'
import {ImportSection} from '../../../Imports/components/ImportSection'
import {LanguageSelect} from '../../../LanguageSelect'

import ArticleTemplateCard from '../ArticleTemplateCard'
import css from './ArticleLandingPage.less'

export type ArticleLandingPageProps = {
    onCreateArticle: () => void
    onCreateArticleWithTemplate: (template?: ArticleTemplate) => void
    canUpdateArticle: boolean | null
    showBackButton: boolean
    onBackButtonClick: () => void
}

const ArticleLandingPageComponent = ({
    onCreateArticle,
    onCreateArticleWithTemplate,
    canUpdateArticle,
    showBackButton,
    onBackButtonClick,
}: ArticleLandingPageProps) => {
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const dispatch = useAppDispatch()

    const handleOnChangeLocale = (value: React.ReactText) => {
        dispatch(changeViewLanguage(validLocaleCode(value)))
    }

    const getArticleTemplates = useGetArticleTemplates(viewLanguage)
    const articleTemplates = getArticleTemplates.data || []

    const handleOnCreate = () => {
        onCreateArticle()
        logEvent(SegmentEvent.HelpCenterTemplatesCreateArticleButtonClicked)
    }

    useEffectOnce(() => {
        logEvent(SegmentEvent.HelpCenterTemplatesLibraryPageViewed)
    })

    return (
        <Container fluid className={css.container}>
            {!showBackButton && <ArticleTemplatesBanner />}
            <div className={css.wrapper}>
                <div className={css.topNav}>
                    <div className={css.buttons}>
                        <ImportSection isButton buttonLabel="Import Content" />
                        <Button
                            onClick={handleOnCreate}
                            color="primary"
                            isDisabled={!canUpdateArticle}
                        >
                            Create Article
                        </Button>
                    </div>
                    {showBackButton && (
                        <div
                            onClick={onBackButtonClick}
                            className={css.backLink}
                        >
                            <i className="material-icons">arrow_back</i>
                            Back to Articles
                        </div>
                    )}
                </div>
                <div className={css.sectionWrapper}>
                    <div className={css.title}>
                        Start with an article template that you can customize to
                        fit your needs:
                    </div>
                    <div>
                        <LanguageSelect
                            value={viewLanguage}
                            onChange={handleOnChangeLocale}
                        />
                    </div>
                </div>
                <div className={css.templatesContainer}>
                    {articleTemplates.map((template) => (
                        <ArticleTemplateCard
                            key={template.key}
                            template={template}
                            onCreateArticleWithTemplate={
                                onCreateArticleWithTemplate
                            }
                            canUpdateArticle={canUpdateArticle}
                        />
                    ))}
                </div>
            </div>
        </Container>
    )
}

const ArticleLandingPage = (props: ArticleLandingPageProps) => (
    <ErrorBoundary
        sentryTags={{
            section: 'article-template',
            team: 'automate-obs',
        }}
    >
        <ArticleLandingPageComponent {...props} />
    </ErrorBoundary>
)

export default ArticleLandingPage
