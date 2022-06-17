import {createNullCache} from '@algolia/cache-common'
import {SearchOptions} from '@algolia/client-search'
import algoliasearch from 'algoliasearch'
import {HelpCenter} from 'models/helpCenter/types'
import {AlgoliaSearchResult} from 'pages/settings/helpCenter/types/algolia'

export interface AlgoliaSearchClient<T> {
    search: (
        query: string,
        requestOptions?: SearchOptions
    ) => Promise<AlgoliaSearchResult<T>>
}

export const initSearchClient = async <T>({
    algolia_api_key,
    algolia_app_id,
    algolia_index_name,
}: HelpCenter): Promise<AlgoliaSearchClient<T> | 'no_api_key' | 'no_index'> => {
    if (algolia_api_key === null) {
        return Promise.resolve('no_api_key')
    }

    const client = algoliasearch(algolia_app_id, algolia_api_key, {
        // we disable Algolia-provided cache mechanisms
        // because otherwise, if the user does a search in a help-center, then adds an article, then does the same search,
        // the request will be skipped and the cached response will be served, despite being out of date (the new article won't be included)
        //
        // doing our own debouncing should be enough to avoid too many requests
        responsesCache: createNullCache(),
        requestsCache: createNullCache(),
    })

    try {
        const searchIndex = client.initIndex(algolia_index_name)

        const indexExists = await searchIndex.exists()
        if (!indexExists) {
            return Promise.resolve('no_index')
        }

        return Promise.resolve({
            search: async (query: string, requestOptions?: SearchOptions) => {
                const {
                    hits: results,
                    nbHits: resultsCount,
                    nbPages,
                } = await searchIndex.search<T>(query, requestOptions)

                return {results, resultsCount, nbPages}
            },
        })
    } catch (error) {
        console.error(error)
        return Promise.resolve('no_index')
    }
}
