import React, {FC} from 'react'

import {Article, HelpCenter} from 'models/helpCenter/types'
import Loader from 'pages/common/components/Loader/Loader'

import {useSearchContext} from '../../providers/SearchContext'

import {SearchBar} from '../SearchBar'
import {SearchResults} from '../SearchResults'
import {ArticleRowActionTypes} from '../../constants'
import {NoResult} from './NoResult'

type Props = {
    helpCenter: HelpCenter
    onArticleClick: (article: Article) => void
    onArticleClickSettings: (
        action: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean
    ) => void
}

export const SearchView: FC<Props> = ({
    helpCenter,
    onArticleClick,
    onArticleClickSettings,
}) => {
    const {searchInput, searchResults} = useSearchContext()

    if (
        searchResults === null ||
        searchResults.state === 'error' ||
        !searchInput
    ) {
        return <SearchBar />
    }

    if (searchResults.state === 'loading') {
        return (
            <>
                <SearchBar />
                <Loader />
            </>
        )
    }

    if (searchResults.results.length === 0) {
        return (
            <>
                <SearchBar /> <NoResult searchInput={searchInput} />
            </>
        )
    }

    return (
        <>
            <SearchBar />
            <SearchResults
                helpCenter={helpCenter}
                results={searchResults.results}
                onArticleClick={onArticleClick}
                onArticleClickSettings={onArticleClickSettings}
            />
        </>
    )
}
