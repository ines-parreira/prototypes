import type React from 'react'
import { useMemo } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { Container } from 'reactstrap'

import { LegacyButton as Button, Skeleton } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { ArticleTemplate } from 'models/helpCenter/types'
import { validLocaleCode } from 'models/helpCenter/utils'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useGetAIArticles } from 'pages/settings/helpCenter/hooks/useGetAIArticles'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { useGetArticleTemplates } from 'pages/settings/helpCenter/queries'
import { getValidStoreIntegrationId } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { getStoreIntegrations } from 'state/integrations/selectors'
import { changeViewLanguage, getViewLanguage } from 'state/ui/helpCenter'

import { useHasAccessToAILibrary } from '../../../AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { ImportSection } from '../../../Imports/components/ImportSection'
import { LanguageSelect } from '../../../LanguageSelect'
import AddArticleCard from '../AddArticleCard'
import AILibraryBanner from '../AILibraryBanner'
import ArticleTemplateCard from '../ArticleTemplateCard'
import ArticleTemplateCardSkeleton from '../ArticleTemplateCard/ArticleTemplateCardSkeleton'
import ArticleTemplatesBanner from '../ArticleTemplatesBanner'

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

    const helpCenter = useCurrentHelpCenter()
    const supportedLocales = helpCenter.supported_locales
    const allStoreIntegrations = useAppSelector(getStoreIntegrations)
    const storeIntegrationId = getValidStoreIntegrationId(
        allStoreIntegrations,
        helpCenter.shop_name,
    )
    const { fetchedArticles: aiArticles, isLoading: isAIArticlesLoading } =
        useGetAIArticles({
            helpCenterId: helpCenter.id,
            storeIntegrationId,
            locale: viewLanguage,
        })

    const hasAIArticlesNotReviewed = useMemo(() => {
        return aiArticles?.some((aiArticle) => !aiArticle.review_action)
    }, [aiArticles])

    const isEmptyStateMode = !showBackButton

    const hasAccessToAILibrary = useHasAccessToAILibrary()

    const showAIBanner =
        hasAccessToAILibrary &&
        isEmptyStateMode &&
        !!aiArticles?.length &&
        hasAIArticlesNotReviewed

    const { setSelectedArticleLanguage } = useEditionManager()

    const dispatch = useAppDispatch()

    const showArticleTemplatesBanner =
        isEmptyStateMode &&
        (!hasAccessToAILibrary || (!showAIBanner && !isAIArticlesLoading))

    const handleOnChangeLocale = (value: React.ReactText) => {
        dispatch(changeViewLanguage(validLocaleCode(value)))
        setSelectedArticleLanguage(validLocaleCode(value))
    }

    const { data, isLoading: isArticleTemplatesLoading } =
        useGetArticleTemplates(viewLanguage)
    const articleTemplates = data || []

    const handleOnCreate = () => {
        onCreateArticle()
        logEvent(SegmentEvent.HelpCenterTemplatesCreateArticleButtonClicked)
    }

    useEffectOnce(() => {
        logEvent(SegmentEvent.HelpCenterTemplatesLibraryPageViewed)
    })

    return (
        <Container fluid className={css.container}>
            {isEmptyStateMode &&
                hasAccessToAILibrary &&
                (isAIArticlesLoading || isArticleTemplatesLoading) && (
                    <Skeleton height={300} width={'100%'} />
                )}
            {showAIBanner && <AILibraryBanner />}
            {showArticleTemplatesBanner && <ArticleTemplatesBanner />}
            <div className={css.wrapper}>
                <div className={css.topNav}>
                    <div className={css.buttons}>
                        {isEmptyStateMode && (
                            <ImportSection
                                isButton
                                buttonLabel="Import Content"
                            />
                        )}
                        <Button
                            onClick={handleOnCreate}
                            intent={isEmptyStateMode ? 'primary' : 'secondary'}
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
                <div
                    className={classNames(css.sectionWrapper, {
                        [css.emptyState]: isEmptyStateMode,
                    })}
                >
                    {isEmptyStateMode ? (
                        <div className={css.title}>
                            Choose a customizable article template:
                        </div>
                    ) : (
                        <div>
                            <div className={css.title}>Standard templates</div>
                            <div className={css.description}>
                                Use an article template as a starting point for
                                your content.
                            </div>
                        </div>
                    )}

                    {supportedLocales.length > 1 && (
                        <div>
                            <LanguageSelect
                                value={viewLanguage}
                                onChange={handleOnChangeLocale}
                            />
                        </div>
                    )}
                </div>
                <div className={css.templatesContainer}>
                    {isArticleTemplatesLoading
                        ? Array(6)
                              .fill(null)
                              .map((_, index) => (
                                  <ArticleTemplateCardSkeleton key={index} />
                              ))
                        : articleTemplates.map((template) => (
                              <ArticleTemplateCard
                                  key={template.key}
                                  template={template}
                                  onCreateArticleWithTemplate={
                                      onCreateArticleWithTemplate
                                  }
                                  canUpdateArticle={canUpdateArticle}
                              />
                          ))}
                    {!isEmptyStateMode && (
                        <AddArticleCard
                            onCreateArticle={onCreateArticle}
                            canUpdateArticle={canUpdateArticle}
                        />
                    )}
                </div>
            </div>
        </Container>
    )
}

const ArticleLandingPage = (props: ArticleLandingPageProps) => (
    <ErrorBoundary
        sentryTags={{
            section: 'article-template',
            team: SentryTeam.CONVAI_KNOWLEDGE,
        }}
    >
        <ArticleLandingPageComponent {...props} />
    </ErrorBoundary>
)

export default ArticleLandingPage
