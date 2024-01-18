import React from 'react'
import {Container} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import {getViewLanguage, changeViewLanguage} from 'state/ui/helpCenter'
import {validLocaleCode} from 'models/helpCenter/utils'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {HELP_CENTER_DEFAULT_LOCALE} from 'pages/settings/helpCenter/constants'

import ArticleTemplatesBanner from '../ArticleTemplatesBanner'
import {ImportSection} from '../../../Imports/components/ImportSection'
import {LanguageSelect} from '../../../LanguageSelect'

import css from './LandingPage.less'

export type LandingPageProps = {
    onCreateArticle: () => void
    canUpdateArticle: boolean | null
}

const LandingPage = ({onCreateArticle, canUpdateArticle}: LandingPageProps) => {
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const dispatch = useAppDispatch()

    const handleOnChangeLocale = (value: React.ReactText) => {
        dispatch(changeViewLanguage(validLocaleCode(value)))
    }

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
            </div>
        </Container>
    )
}

export default LandingPage
