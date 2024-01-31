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
import ArticleTemplatesBanner from '../ArticleTemplatesBanner'
import {ImportSection} from '../../../Imports/components/ImportSection'
import {LanguageSelect} from '../../../LanguageSelect'

import ArticleTemplateCard from '../ArticleTemplateCard'
import css from './ArticleLandingPage.less'

export type ArticleLandingPageProps = {
    onCreateArticle: () => void
    onCreateArticleWithTemplate: (template?: ArticleTemplate) => void
    canUpdateArticle: boolean | null
}

const ArticleLandingPage = ({
    onCreateArticle,
    onCreateArticleWithTemplate,
    canUpdateArticle,
}: ArticleLandingPageProps) => {
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const dispatch = useAppDispatch()

    const handleOnChangeLocale = (value: React.ReactText) => {
        dispatch(changeViewLanguage(validLocaleCode(value)))
    }

    const getArticleTemplates = useGetArticleTemplates(viewLanguage)
    const articleTemplates = getArticleTemplates.data || []

    return (
        <Container fluid className={css.container}>
            <ArticleTemplatesBanner />
            <div className={css.wrapper}>
                <div className={css.buttons}>
                    <ImportSection isButton buttonLabel="Import Content" />
                    <Button
                        onClick={onCreateArticle}
                        color="primary"
                        isDisabled={!canUpdateArticle}
                    >
                        Create Article
                    </Button>
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

export default ArticleLandingPage
