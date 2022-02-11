import {useMemo} from 'react'
import {useLocation} from 'react-router-dom'
import {parse} from 'qs'

export default function useSearch<T extends Record<string, unknown>>() {
    const {search} = useLocation()
    const parsedSearch = useMemo(
        () => parse(search, {ignoreQueryPrefix: true}),
        [search]
    )

    return parsedSearch as T
}
