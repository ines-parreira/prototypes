import {CancelToken} from 'axios'
import {fromJS, List, Map} from 'immutable'
import React, {useMemo, useState, useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {ActionTemplateExecution} from 'config'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {useOptions} from 'pages/common/components/ast/widget/hooks'
import Select from 'pages/common/components/ast/widget/ReactSelect'
import {fetchAllMacros, getMacro} from 'state/macro/actions'
import {Macro} from 'state/macro/types'
import {RootState} from 'state/types'
import {getActionTemplate} from 'utils'

type OwnProps = {
    onChange: (value: any) => void
    value: string
    className?: string
}

const MacroSelect = ({
    className,
    value,
    onChange,
    fetchAllMacros,
    getMacro,
    macros,
}: OwnProps & ConnectedProps<typeof connector>) => {
    const [isLoading, setIsLoading] = useState(false)
    const [searchResults, setSearchResults] = useState(fromJS([]))
    const [search, setSearch] = useState('')
    const selectedMacro: Maybe<Macro> = value
        ? macros?.get(parseInt(value))
        : null
    const macroOptions = useOptions(
        selectedMacro,
        searchResults,
        (macro) => macro.get('id') as string
    )
    const [handleMacrosSearch] = useCancellableRequest(
        (cancelToken: CancelToken) => async () => {
            setIsLoading(true)
            const res = await fetchAllMacros({search}, cancelToken)
            if (res) {
                setIsLoading(false)
                setSearchResults(res)
            }
        }
    )

    useEffect(() => {
        if (selectedMacro) {
            return
        }
        void getMacro(value)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMacro])

    useEffect(() => {
        void handleMacrosSearch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])

    const options = useMemo(() => {
        if (isLoading) {
            return fromJS([]) as List<any>
        }
        // Filter out macros with external actions
        return (
            macroOptions.filter((macro: Map<any, any>) =>
                ((macro.get('actions', fromJS([])) as List<any>) ?? fromJS([]))
                    .filter(
                        (action: Map<any, any>) =>
                            getActionTemplate(action.get('name'))?.execution ===
                            ActionTemplateExecution.External
                    )
                    .isEmpty()
            ) as List<any>
        )
            .map(
                (macro: Map<any, any>) =>
                    fromJS({
                        value: (macro.get('id') as number).toString(),
                        label: macro.get('name'),
                    }) as Map<any, any>
            )
            .toList()
            .sortBy((macro: Maybe<Map<any, any>>) =>
                (
                    ((macro as Map<any, any>).get('label') || '') as string
                ).toLowerCase()
            )
    }, [macroOptions, isLoading])

    return (
        <Select
            className={className}
            value={value}
            onChange={onChange}
            onSearchChange={setSearch}
            options={options.toJS()}
            focusedPlaceholder="Search macros by name..."
        />
    )
}

const connector = connect(
    (state: RootState) => ({
        macros: state.macros?.get('items') as Map<number, any>,
    }),
    {
        fetchAllMacros,
        getMacro,
    }
)

export default connector(MacroSelect)
