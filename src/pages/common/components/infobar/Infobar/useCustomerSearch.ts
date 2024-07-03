import {AxiosError, AxiosResponse, CancelToken} from 'axios'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useState} from 'react'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {Customer} from 'models/customer/types'
import {
    CustomerWithHighlightsResponse,
    PickedCustomerWithHighlights,
    SearchEngine,
    SearchResponse,
} from 'models/search/types'
import * as infobarActions from 'state/infobar/actions'

export const useCustomerSearch = () => {
    const isSearchWithHighlights =
        useFlags()[FeatureFlagKey.InfobarSearchWithHighlights] !== false
    const dispatch = useAppDispatch()
    const searchRank = useSearchRankScenario(SearchRankSource.CustomerProfile)
    const [isSearching, setIsSearching] = useState(false)
    const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(
        null
    )
    const [searchTerm, setSearchTerm] = useState('')
    const [displaySearchResults, setDisplaySearchResults] = useState(false)
    const [searchResults, setSearchResults] = useState<
        PickedCustomerWithHighlights[]
    >([])

    const [cancellableSearch] = useCancellableRequest(
        (cancelToken: CancelToken) => async (query) =>
            await dispatch(infobarActions.search(query, cancelToken))
    )

    const [cancellableSearchWithHighlights] = useCancellableRequest(
        (cancelToken: CancelToken) => async (query) =>
            await dispatch(
                infobarActions.searchWithHighlights(query, cancelToken)
            )
    )

    const highlightsSearch = async (query: string) => {
        const res = await (
            cancellableSearchWithHighlights as (query: string) => Promise<{
                error?: AxiosError<{error?: {message: string}}>
                resp: AxiosResponse<
                    ApiListResponseCursorPagination<
                        CustomerWithHighlightsResponse[]
                    >
                >
            }>
        )(query)

        const {error, resp} = res

        return {
            error,
            data: resp.data.data.map((item) => ({
                ...item.entity,
                highlights: item.highlights,
            })),
        }
    }
    const noHighlightsSearch = async (query: string) => {
        const res = await (
            cancellableSearch as (query: string) => Promise<
                | {
                      resp: SearchResponse<Customer>
                  }
                | {
                      error: AxiosError<{error?: {message: string}}>
                  }
                | undefined
            >
        )(query)

        if (!res) {
            return null
        }

        if ('error' in res) {
            return {
                error: res.error,
            }
        }

        return {data: res.resp.data}
    }

    const onSearchSubmit = async (query: string) => {
        const search = isSearchWithHighlights
            ? highlightsSearch
            : noHighlightsSearch
        searchRank.endScenario()

        searchRank.registerResultsRequest({
            query,
            requestTime: Date.now(),
        })
        setIsSearching(true)
        const res = await search(query)
        if (!res) {
            return
        }

        const {error, data} = res

        let errorMessage = null

        if (error) {
            errorMessage =
                error?.response?.data?.error?.message ||
                'Failed to do the search. Please try again.'
        }

        searchRank.registerResultsResponse({
            responseTime: Date.now(),
            numberOfResults: !error ? data.length : 0,
            searchEngine: !error ? SearchEngine.ES : undefined,
        })
        setSearchErrorMessage(errorMessage)
        setDisplaySearchResults(true)
        setIsSearching(false)
        setSearchResults(error ? [] : data.slice(0, 8))
    }

    const resetSearch = () => {
        setDisplaySearchResults(false)
        setSearchResults(fromJS([]))
        searchRank.endScenario()
    }
    return {
        displaySearchResults,
        isSearching,
        onSearchSubmit,
        resetSearch,
        searchErrorMessage,
        searchResults,
        searchRank,
        searchTerm,
        setSearchTerm,
    }
}
