import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {MacrosProperties} from 'models/macro/types'
import {getMacroParametersOptions} from 'state/macro/selectors'
import {getTicket} from 'state/ticket/selectors'

export default function useInitialMacroFilters() {
    const ticket = useAppSelector(getTicket)
    const macroFilterOptions = useAppSelector(getMacroParametersOptions)

    return useMemo(() => {
        const options = (macroFilterOptions?.toJS() || {}) as MacrosProperties
        if (!ticket.language || !options.languages?.length) return {}

        return options.languages.includes(ticket.language)
            ? {languages: [ticket.language]}
            : {}
    }, [macroFilterOptions, ticket.language])
}
