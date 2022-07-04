import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useUnmount} from 'react-use'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {SearchEngine} from 'models/search/types'

export enum SearchRankSource {
    CustomerProfile = 'customer_profile',
    CustomerChannelEmail = 'customer_channel_email',
    CustomerChannelPhone = 'customer_channel_phone',
}

export type SearchRankRequest = {
    query: string
    requestTime: number
}

export type SearchRankResponse = {
    responseTime: number
    numberOfResults: number
    searchEngine?: SearchEngine
}

export type SearchRankSelectedItem = {
    id: string | number
    index: number
}

const DATABASE_TYPE: Record<SearchEngine, string> = {
    [SearchEngine.ES]: 'elasticsearch',
    [SearchEngine.PG]: 'postgres',
}

export default function useSearchRankScenario(
    source: SearchRankSource,
    scenarioTimeout = 60000
) {
    const request = useRef<SearchRankRequest | undefined>()
    const response = useRef<SearchRankResponse | undefined>()
    const selectedItem = useRef<SearchRankSelectedItem | undefined>()
    const timeout = useRef<NodeJS.Timeout | undefined>()
    const [isLive, setIsLive] = useState(false)
    const currentAccount = useAppSelector(getCurrentAccountState)

    const endScenario = useCallback(() => {
        if (request.current && response.current) {
            const {query, requestTime} = request.current
            const {responseTime, numberOfResults, searchEngine} =
                response.current
            logEvent(SegmentEvent.SearchQueryRanked, {
                search_query: query,
                datetime: new Date(requestTime).toISOString(),
                query_source: source,
                response_time: responseTime - requestTime,
                account_domain: currentAccount.get('domain'),
                number_of_results: numberOfResults,
                rank: selectedItem.current
                    ? selectedItem.current.index + 1
                    : -1,
                result_object_id: selectedItem?.current?.id,
                database_type: searchEngine
                    ? DATABASE_TYPE[searchEngine]
                    : SearchEngine.PG,
            })
            request.current = undefined
            response.current = undefined
        }
        if (timeout.current) {
            clearTimeout(timeout.current)
        }
        setIsLive(false)
        selectedItem.current = undefined
    }, [source, currentAccount])

    const registerResultsRequest = useCallback(
        (req: SearchRankRequest) => {
            endScenario()
            request.current = req
        },
        [endScenario]
    )

    const registerResultsResponse = useCallback(
        (res: SearchRankResponse) => {
            endScenario()
            response.current = res
            setIsLive(true)
        },
        [endScenario]
    )

    const registerResultSelection = useCallback(
        ({index, id}: SearchRankSelectedItem) => {
            selectedItem.current = {index, id}
        },
        []
    )

    useEffect(() => {
        if (timeout.current) {
            clearTimeout(timeout.current)
        }
        if (isLive) {
            if (response.current?.numberOfResults) {
                timeout.current = setTimeout(endScenario, scenarioTimeout)
            } else {
                endScenario()
            }
        }
    }, [isLive, endScenario, scenarioTimeout])

    useUnmount(endScenario)

    return useMemo(() => {
        return {
            isRunning: isLive,
            registerResultsRequest,
            registerResultsResponse,
            registerResultSelection,
            endScenario,
        }
    }, [
        isLive,
        registerResultsRequest,
        registerResultsResponse,
        registerResultSelection,
        endScenario,
    ])
}
