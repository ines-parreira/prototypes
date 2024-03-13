import React, {FC, useRef} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {Article, HelpCenter} from 'models/helpCenter/types'

import Button from 'pages/common/components/button/Button'
import {getUncategorizedArticles} from 'state/entities/helpCenter/articles'
import {
    getCategories,
    getRootCategory,
} from 'state/entities/helpCenter/categories'
import useAppSelector from 'hooks/useAppSelector'
import DropdownButton from 'pages/common/components/button/DropdownButton'
import UncontrolledDropdown from 'pages/common/components/dropdown/UncontrolledDropdown'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {useSearchContext} from '../../providers/SearchContext'

import {SearchBar} from '../SearchBar'
import {SearchResults} from '../SearchResults'
import {ArticleRowActionTypes} from '../../constants'
import {CategoriesTableSkeleton} from '../CategoriesTableSkeleton'
import {ImportSection} from '../Imports/components/ImportSection'
import {NoResult} from './NoResult'

import css from './SearchView.less'

type Props = {
    helpCenter: HelpCenter
    onArticleClick: (article: Article) => void
    onArticleClickSettings: (
        action: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean
    ) => void
    onArticleCreate: () => void
    onShowTemplates: () => void
    onCategoryCreate: () => void
    canUpdateArticle: boolean | null
    canUpdateCategory: boolean | null
}

type HeaderProps = Pick<
    Props,
    | 'onArticleCreate'
    | 'onCategoryCreate'
    | 'onShowTemplates'
    | 'canUpdateArticle'
    | 'canUpdateCategory'
>

const Header: FC<HeaderProps> = ({
    onArticleCreate,
    onCategoryCreate,
    onShowTemplates,
    canUpdateArticle,
    canUpdateCategory,
}) => {
    const dropdownTargetRef = useRef<HTMLDivElement>(null)
    const articleTemplatesFlag =
        useFlags()[FeatureFlagKey.ObservabilityArticleTemplates]

    const handleArticleFromScratchClick = () => {
        onArticleCreate()
        logEvent(SegmentEvent.HelpCenterTemplatesFromScratchButtonClicked)
    }

    const handleArticleFromTemplateClick = () => {
        onShowTemplates()
        logEvent(SegmentEvent.HelpCenterTemplatesUseTemplateButtonClicked)
    }

    const onCreateClick = () => {
        logEvent(SegmentEvent.HelpCenterTemplatesCreateArticleButtonClicked)
    }

    return (
        <div className={css.wrapper}>
            <SearchBar />

            <ImportSection isButton />
            <Button
                isDisabled={!canUpdateCategory}
                intent="secondary"
                className={css.button}
                onClick={onCategoryCreate}
            >
                Create Category
            </Button>
            {!articleTemplatesFlag ? (
                <Button
                    isDisabled={!canUpdateArticle}
                    intent="primary"
                    className={css.button}
                    onClick={onArticleCreate}
                >
                    Create Article
                </Button>
            ) : (
                <>
                    <DropdownButton
                        color="primary"
                        fillStyle="fill"
                        ref={dropdownTargetRef}
                        isDisabled={!canUpdateArticle}
                        onClick={onCreateClick}
                        onToggleClick={onCreateClick}
                    >
                        Create Article
                    </DropdownButton>
                    <UncontrolledDropdown
                        target={dropdownTargetRef}
                        placement="bottom-end"
                    >
                        <DropdownBody>
                            <DropdownItem
                                option={{
                                    label: 'Use template',
                                    value: 'create_with_template',
                                }}
                                onClick={handleArticleFromTemplateClick}
                                shouldCloseOnSelect
                            />
                            <DropdownItem
                                option={{
                                    label: 'From scratch',
                                    value: 'create',
                                }}
                                onClick={handleArticleFromScratchClick}
                                shouldCloseOnSelect
                            />
                        </DropdownBody>
                    </UncontrolledDropdown>
                </>
            )}
        </div>
    )
}

export const SearchView: FC<Props> = ({
    helpCenter,
    onArticleClick,
    onArticleClickSettings,
    onArticleCreate,
    onShowTemplates,
    onCategoryCreate,
    canUpdateArticle,
    canUpdateCategory,
}) => {
    const {searchInput, searchResults} = useSearchContext()

    const categories = useAppSelector(getCategories)
    const uncategorizedArticles = useAppSelector(getUncategorizedArticles)

    const uncategorizedArticleCount =
        useAppSelector(getRootCategory).articleCount

    if (
        categories.length === 1 &&
        uncategorizedArticles.length === 0 &&
        uncategorizedArticleCount === 0
    ) {
        return null
    }

    if (
        searchResults === null ||
        searchResults.state === 'error' ||
        !searchInput
    ) {
        return (
            <Header
                onArticleCreate={onArticleCreate}
                onCategoryCreate={onCategoryCreate}
                onShowTemplates={onShowTemplates}
                canUpdateArticle={canUpdateArticle}
                canUpdateCategory={canUpdateCategory}
            />
        )
    }

    if (searchResults.state === 'loading') {
        return (
            <>
                <Header
                    onArticleCreate={onArticleCreate}
                    onCategoryCreate={onCategoryCreate}
                    onShowTemplates={onShowTemplates}
                    canUpdateArticle={canUpdateArticle}
                    canUpdateCategory={canUpdateCategory}
                />
                <CategoriesTableSkeleton />
            </>
        )
    }

    if (searchResults.results.length === 0) {
        return (
            <>
                <Header
                    onArticleCreate={onArticleCreate}
                    onCategoryCreate={onCategoryCreate}
                    onShowTemplates={onShowTemplates}
                    canUpdateArticle={canUpdateArticle}
                    canUpdateCategory={canUpdateCategory}
                />
                <NoResult searchInput={searchInput} />
            </>
        )
    }

    return (
        <>
            <Header
                onArticleCreate={onArticleCreate}
                onCategoryCreate={onCategoryCreate}
                onShowTemplates={onShowTemplates}
                canUpdateArticle={canUpdateArticle}
                canUpdateCategory={canUpdateCategory}
            />
            <SearchResults
                helpCenter={helpCenter}
                results={searchResults.results}
                onArticleClick={onArticleClick}
                onArticleClickSettings={onArticleClickSettings}
            />
        </>
    )
}
