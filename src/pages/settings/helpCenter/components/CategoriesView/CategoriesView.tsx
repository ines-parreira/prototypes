import React from 'react'
import {Container} from 'reactstrap'
import {NavLink} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import standalonePreview from 'assets/img/presentationals/standalone-self-service-portal.png'

import Button from 'pages/common/components/button/Button'
import {Banner} from 'pages/common/components/Banner'

import {HelpCenter} from 'models/helpCenter/types'
import {getUncategorizedArticles} from 'state/entities/helpCenter/articles'
import {getViewLanguage} from 'state/ui/helpCenter'
import {
    CategoriesTable,
    CategoriesTableProps,
} from 'pages/settings/helpCenter/components/CategoriesTable'
import {ImportSection} from 'pages/settings/helpCenter/components/Imports/components/ImportSection'
import {CATEGORIES_PER_PAGE} from 'pages/settings/helpCenter/constants'
import {useCategoriesActions} from 'pages/settings/helpCenter/hooks/useCategoriesActions'
import {useHelpCenterCategories} from 'pages/settings/helpCenter/hooks/useHelpCenterCategories'
import settingsCss from 'pages/settings/settings.less'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'

import {CategoriesTableSkeleton} from '../CategoriesTableSkeleton'
import {CategoriesPositionsType} from '../CategoriesTable/CategoriesTable'
import {useSearchContext} from '../../providers/SearchContext'
import {useAbilityChecker} from '../../hooks/useHelpCenterApi'

import {getRootCategory} from '../../../../../state/entities/helpCenter/categories'

import css from './CategoriesView.less'
import LandingPage from './components/LandingPage'

type Props = Pick<CategoriesTableProps, 'renderArticleList'> & {
    helpCenter: HelpCenter
    onCreateArticle: () => void
    onCreateCategory: () => void
}

export const CategoriesViews = ({
    helpCenter,
    renderArticleList,
    onCreateArticle,
    onCreateCategory,
}: Props): JSX.Element | null => {
    const actions = useCategoriesActions()
    const uncategorizedArticles = useAppSelector(getUncategorizedArticles)
    const viewLanguage =
        useAppSelector(getViewLanguage) || helpCenter.default_locale
    const {categories, isLoading} = useHelpCenterCategories({
        per_page: CATEGORIES_PER_PAGE,
        locale: viewLanguage,
    })
    const {isPassingRulesCheck} = useAbilityChecker()
    const {setSearchInput} = useSearchContext()
    const articleTemplatesFlag =
        useFlags()[FeatureFlagKey.ObservabilityArticleTemplates]

    const handleOnReorder = ({
        categories,
        categoryId,
        defaultSiblingsPositions,
    }: CategoriesPositionsType) => {
        if (categories.length) {
            void actions.updateCategoriesPositions({
                categories,
                categoryId,
                defaultSiblingsPositions,
            })
            setSearchInput('')
        }
    }

    const uncategorizedArticleCount =
        useAppSelector(getRootCategory).articleCount

    const baseURL = `/app/settings/help-center/${helpCenter.id}`

    const showCreateFirst =
        !isLoading &&
        categories.length === 1 &&
        uncategorizedArticles.length === 0 &&
        uncategorizedArticleCount === 0

    const showLandingPage = showCreateFirst && articleTemplatesFlag

    const canUpdateArticle = isPassingRulesCheck(({can}) =>
        can('update', 'ArticleEntity')
    )

    const canUpdateCategory = isPassingRulesCheck(({can}) =>
        can('update', 'CategoryEntity')
    )

    if (isLoading && categories.length === 1) {
        return <CategoriesTableSkeleton />
    }

    return (
        <>
            {showCreateFirst ? (
                showLandingPage ? (
                    <LandingPage
                        canUpdateArticle={canUpdateArticle}
                        onCreateArticle={onCreateArticle}
                    />
                ) : (
                    <Container fluid className={settingsCss.pageContainer}>
                        <h1>
                            Start your help center here&nbsp;
                            <span aria-label="books" role="img">
                                📚
                            </span>
                        </h1>
                        <p>
                            Write your first article or create your first
                            category to be displayed in your very own help
                            center.
                        </p>
                        <div className={css.createFirst}>
                            <Button
                                className={css.createButton}
                                onClick={onCreateArticle}
                                isDisabled={!canUpdateArticle}
                            >
                                <i className="material-icons-outlined mr-1">
                                    add
                                </i>
                                Article
                            </Button>

                            <Button
                                className={css.createButton}
                                intent="secondary"
                                onClick={onCreateCategory}
                                isDisabled={!canUpdateCategory}
                            >
                                <i className="material-icons mr-1">add</i>
                                Category
                            </Button>
                        </div>

                        <ImportSection
                            className={css.importSection}
                            isDisabled={
                                !(canUpdateArticle && canUpdateCategory)
                            }
                        />

                        {helpCenter.source === 'automation' && (
                            <div className={css.bannerContainer}>
                                <Banner
                                    preview={
                                        <img
                                            className={css.bannerImage}
                                            src={standalonePreview}
                                            alt=""
                                        />
                                    }
                                    title="Not ready to add articles? Customize your Help Center in the meantime."
                                >
                                    <div className={css.bannerContent}>
                                        <div>
                                            <div>
                                                We created a Help Center to help
                                                get you started. Customize it by
                                                adding a logo,
                                            </div>
                                            <div>
                                                background image, your brand
                                                color and fonts, and more!
                                            </div>
                                        </div>
                                        <NavLink
                                            className={css.bannerLink}
                                            to={`${baseURL}/appearance`}
                                            exact
                                        >
                                            Customize Help Center
                                        </NavLink>
                                    </div>
                                </Banner>
                            </div>
                        )}
                    </Container>
                )
            ) : (
                <CategoriesTable
                    renderArticleList={renderArticleList}
                    onReorderFinish={handleOnReorder}
                    shouldRenderEmptyUncategorizedRow={!showCreateFirst}
                    isLoading={isLoading}
                />
            )}
        </>
    )
}
