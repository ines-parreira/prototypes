import React, {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

import useSearch from 'hooks/useSearch'

import {
    CampaignListOptionsContext,
    PartialOptionsParams,
    defaultParams,
} from './context'
import {updateUrlWithSearchParams} from './utils'

interface Props {
    children: ReactNode
}

export const CampaignListOptions = ({children}: Props) => {
    const params = useSearch<{
        page?: string
        search?: string
        state?: string
    }>()

    const [page, setPage] = useState(
        params?.page ? parseInt(params.page, 10) : defaultParams.page
    )
    const [search, setSearch] = useState(params.search ?? defaultParams.search)
    const [state, setState] = useState(params.state ?? defaultParams.state)

    useEffect(
        () => {
            updateUrlWithSearchParams({
                page,
                search,
                state,
            })
        },
        // We ensure the URL reflects the current options state
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    useEffect(() => {
        if (params.page) {
            setPage(parseInt(params.page, 10))
        }
        if (params.search) {
            setSearch(params.search)
        }

        if (params.state) {
            setState(params.state)
        }
    }, [params])

    const handleChangeParams = useCallback(
        (params: PartialOptionsParams) => {
            if (params.page !== undefined) {
                setPage(params.page)
            }

            if (params.search !== undefined) {
                setSearch(params.search)
            }

            if (params.state !== undefined) {
                setState(params.state)
            }

            updateUrlWithSearchParams({
                page,
                search,
                state,
                ...params,
            })
        },
        [page, search, state]
    )

    const handleGetParams = useCallback(
        () => ({
            page,
            search,
            state,
        }),
        [page, search, state]
    )

    const memoValue = useMemo(
        () => ({
            getParams: handleGetParams,
            onChangeParams: handleChangeParams,
        }),
        [handleChangeParams, handleGetParams]
    )

    return (
        <CampaignListOptionsContext.Provider value={memoValue}>
            {children}
        </CampaignListOptionsContext.Provider>
    )
}
