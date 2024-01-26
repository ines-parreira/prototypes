import {useCallback, useMemo} from 'react'
import {useLocation} from 'react-router-dom'

import history from 'pages/history'

export const useSearchParam = (searchParamLabel: string) => {
    const {search} = useLocation()
    const searchParams = useMemo(() => new URLSearchParams(search), [search])
    const searchParam = searchParams.get(searchParamLabel)

    const setSearchParam = useCallback(
        (value: string | null) => {
            if (value === null) {
                searchParams.delete(searchParamLabel)
                history.replace({search: searchParams.toString()})
                return
            }
            searchParams.set(searchParamLabel, value)
            history.replace({search: searchParams.toString()})
        },
        [searchParamLabel, searchParams]
    )

    return [searchParam, setSearchParam] as const
}
