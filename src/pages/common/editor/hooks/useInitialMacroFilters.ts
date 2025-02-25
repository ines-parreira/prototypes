import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { MacrosProperties } from 'models/macro/types'
import { getMacroParametersOptions } from 'state/macro/selectors'
import { getTicket } from 'state/ticket/selectors'

export default function useInitialMacroFilters() {
    const ticket = useAppSelector(getTicket)
    const macroFilterOptions = useAppSelector(getMacroParametersOptions)

    return useMemo(() => {
        const options = (macroFilterOptions?.toJS() || {}) as MacrosProperties
        if (!ticket.language || !options.languages?.length) return {}

        // when a specific language is set, we want to include an empty string
        // so macros that don't have any language set at all are also included
        // in the search results. This mimics previous behaviour.
        return options.languages.includes(ticket.language)
            ? { languages: [ticket.language, ''] }
            : {}
    }, [macroFilterOptions, ticket.language])
}
