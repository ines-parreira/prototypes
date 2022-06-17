import React, {
    createContext,
    useContext,
    useState,
    Dispatch,
    SetStateAction,
    useEffect,
} from 'react'
import _debounce from 'lodash/debounce'

import {HelpCenter} from 'models/helpCenter/types'
import {
    AlgoliaSearchClient,
    initSearchClient,
} from 'pages/settings/helpCenter/utils/algolia'
import {
    AlgoliaHit,
    AlgoliaRecordTags,
    EntitiesArticleRecord,
    EntitiesCategoryRecord,
} from '../../types/algolia'

const SEARCH_DEBOUNCE_DELAY_MS = 1000

export type SearchStateLoading = {
    state: 'loading'
}

export type FlatAlgoliaSearchResults = AlgoliaHit<
    EntitiesArticleRecord | EntitiesCategoryRecord
>[]

export type SearchStateReady = {
    state: 'ready'
    results: FlatAlgoliaSearchResults
    resultsCount: number
    nbPages: number
}

export type SearchStateError = {
    state: 'error'
    error: any
}

export type SearchState =
    | SearchStateLoading
    | SearchStateReady
    | SearchStateError

type SearchContextValues = {
    searchInput: string
    setSearchInput: Dispatch<SetStateAction<string>>

    searchResults: SearchState | null
    setSearchResults: Dispatch<SetStateAction<SearchState | null>>

    searchReady: boolean
}

const SearchContext = createContext<null | SearchContextValues>(null)

const atLeast3Characters = (input: string) => input.trim().length > 2

export interface SearchContextProviderProps {
    children: React.ReactNode
    helpCenter: HelpCenter
}

export const SearchContextProvider = ({
    children,
    helpCenter,
}: SearchContextProviderProps): JSX.Element => {
    const [searchInput, setSearchInput] = useState<string>('')

    const [searchResults, setSearchResults] = useState<SearchState | null>(null)

    const [searchIndex, setSearchIndex] = useState<AlgoliaSearchClient<
        EntitiesArticleRecord | EntitiesCategoryRecord
    > | null>(null)

    useEffect(() => {
        const queryCall = _debounce((query: string) => {
            if (!searchIndex) {
                return
            }

            setSearchResults({
                state: 'loading',
            })

            const tagFilters: AlgoliaRecordTags[] = ['latest_draft']

            void searchIndex
                .search(query, {
                    highlightPreTag: '<span class="search-highlight">',
                    highlightPostTag: '</span>',
                    facetFilters: [],
                    restrictSearchableAttributes: [
                        'title_draft',
                        'preview_draft',
                        'article_content_draft',
                    ],
                    tagFilters,
                })
                .then(({results, resultsCount, nbPages}) =>
                    setSearchResults({
                        state: 'ready',
                        results,
                        resultsCount,
                        nbPages,
                    })
                )
                .catch((error) => {
                    console.error(
                        'Error fetching search results from Algolia:',
                        error
                    )
                    setSearchResults({state: 'error', error})
                })
        }, SEARCH_DEBOUNCE_DELAY_MS)

        if (atLeast3Characters(searchInput)) {
            queryCall(searchInput)
        } else {
            setSearchResults(null)
        }

        return () => {
            if (queryCall.cancel) {
                queryCall.cancel()
            }
        }
    }, [searchIndex, searchInput])

    useEffect(() => {
        initSearchClient<EntitiesArticleRecord | EntitiesCategoryRecord>(
            helpCenter
        )
            .then((indexOrError) => {
                if (
                    indexOrError === 'no_api_key' ||
                    indexOrError === 'no_index'
                ) {
                    console.error(
                        `Error during Algolia search client initialization: ${indexOrError}`
                    )

                    setSearchIndex(null)
                } else {
                    setSearchIndex(indexOrError)
                }
            })
            .catch((error) => console.error(error))
    }, [helpCenter])

    const contextValues: SearchContextValues = {
        searchInput,
        setSearchInput,
        searchResults,
        setSearchResults,
        searchReady: searchIndex !== null,
    }

    return (
        <SearchContext.Provider value={contextValues}>
            {children}
        </SearchContext.Provider>
    )
}

export const useSearchContext = () => {
    const values = useContext(SearchContext)

    if (!values) {
        throw new Error(
            `useSearch should be used inside the SearchContextProvider context provider`
        )
    }

    return values
}
