import {AxiosError, AxiosResponse, CancelToken} from 'axios'
import {fromJS} from 'immutable'
import {useState} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {
    CustomerWithHighlightsResponse,
    PickedCustomerWithHighlights,
    SearchEngine,
} from 'models/search/types'
import {searchWithHighlights} from 'state/infobar/actions'

export const useCustomerSearch = () => {
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

    const [cancellableSearchWithHighlights] = useCancellableRequest(
        (cancelToken: CancelToken) => async (query) =>
            await dispatch(searchWithHighlights(query, cancelToken))
    )

    const search = async (query: string) => {
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
            data: resp?.data.data.map((item) => ({
                ...item.entity,
                highlights: item.highlights,
            })),
        }
    }

    const onSearchSubmit = async (query: string) => {
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
