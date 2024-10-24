import {parse} from 'qs'
import {useMemo} from 'react'
import {useLocation} from 'react-router-dom'

export default function useSearch<T extends Record<string, unknown>>() {
    const {search} = useLocation()
    const parsedSearch = useMemo(
        () => parse(search, {ignoreQueryPrefix: true}),
        [search]
    )

    return parsedSearch as Partial<T>
}
