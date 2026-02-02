import { useCallback, useMemo } from 'react'

import { useSearchParams } from '@repo/routing'

import type { ListMacrosParams } from '@gorgias/helpdesk-queries'

import { MacroSearchParamsKeys } from '../utils/MacroSearchParamsKeys'

const DEFAULT_ORDER_BY = 'created_datetime:asc'

type MacroListSearchParams = Pick<
    ListMacrosParams,
    'search' | 'tags' | 'languages' | 'order_by' | 'cursor'
>

type SetMacroListSearchParams = (
    updater:
        | MacroListSearchParams
        | ((prev: MacroListSearchParams) => MacroListSearchParams),
) => void

export function useMacroListSearchParams(): [
    MacroListSearchParams,
    SetMacroListSearchParams,
] {
    const [searchParams, setSearchParams] = useSearchParams()

    const listMacrosParams = useMemo<MacroListSearchParams>(() => {
        const { search, tags, languages, orderBy, cursor } =
            MacroSearchParamsKeys

        return {
            search: search.parse(searchParams.get(search.key)),
            tags: tags.parse(searchParams.get(tags.key)),
            languages: languages.parse(searchParams.get(languages.key)),
            order_by: (orderBy.parse(searchParams.get(orderBy.key)) ||
                DEFAULT_ORDER_BY) as MacroListSearchParams['order_by'],
            cursor: cursor.parse(searchParams.get(cursor.key)),
        }
    }, [searchParams])

    const setListMacrosParams = useCallback<SetMacroListSearchParams>(
        (updater) => {
            const newParams =
                typeof updater === 'function'
                    ? updater(listMacrosParams)
                    : updater

            const { search, tags, languages, orderBy, cursor } =
                MacroSearchParamsKeys

            const urlParams: Record<string, string> = {}

            const searchValue = search.serialize(newParams.search)
            if (searchValue) urlParams[search.key] = searchValue

            const tagsValue = tags.serialize(newParams.tags)
            if (tagsValue) urlParams[tags.key] = tagsValue

            const languagesValue = languages.serialize(newParams.languages)
            if (languagesValue) urlParams[languages.key] = languagesValue

            const orderByValue = orderBy.serialize(newParams.order_by)
            if (orderByValue && orderByValue !== DEFAULT_ORDER_BY) {
                urlParams[orderBy.key] = orderByValue
            }

            const cursorValue = cursor.serialize(newParams.cursor)
            if (cursorValue) urlParams[cursor.key] = cursorValue

            setSearchParams(urlParams)
        },
        [listMacrosParams, setSearchParams],
    )

    return [listMacrosParams, setListMacrosParams]
}
