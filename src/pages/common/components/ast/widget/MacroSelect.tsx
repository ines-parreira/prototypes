import React, {useMemo, useState, useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List, Map} from 'immutable'
import {CancelToken} from 'axios'

import {getActionTemplate} from '../../../../../utils'
import {RootState} from '../../../../../state/types'
import {fetchMacros, getMacro} from '../../../../../state/macro/actions'
import useCancellableRequest from '../../../../../hooks/useCancellableRequest'
import {Macro} from '../../../../../state/macro/types'

import Select from './ReactSelect'
import {useOptions} from './hooks'

type OwnProps = {
    onChange: (value: any) => void
    value: string
    className?: string
}

const MacroSelect = ({
    className,
    value,
    onChange,
    fetchMacros,
    getMacro,
    macros,
}: OwnProps & ConnectedProps<typeof connector>) => {
    const [isLoading, setIsLoading] = useState(false)
    const [searchResults, setSearchResults] = useState(fromJS([]))
    const [search, setSearch] = useState('')
    const selectedMacro: Maybe<Macro> = value
        ? macros.get(parseInt(value))
        : null
    const macroOptions = useOptions(
        selectedMacro,
        searchResults,
        (macro) => macro.get('id') as string
    )
    const [handleMacrosSearch] = useCancellableRequest(
        (cancelToken: CancelToken) => async () => {
            setIsLoading(true)
            const res = await fetchMacros({search}, '', 'asc', cancelToken)
            if (res) {
                setIsLoading(false)
                setSearchResults(res.macros)
            }
        }
    )

    useEffect(() => {
        if (selectedMacro) {
            return
        }
        void getMacro(value)
    }, [selectedMacro])

    useEffect(() => {
        void handleMacrosSearch()
    }, [search])

    const options = useMemo(() => {
        if (isLoading) {
            return fromJS([]) as List<any>
        }
        // Filter out macros with external actions
        return (
            macroOptions.filter((macro: Map<any, any>) =>
                (macro.get('actions') as List<any>)
                    .filter((action: Map<any, any>) => {
                        const actionTemplate = getActionTemplate(
                            action.get('name')
                        )
                        return (actionTemplate &&
                            actionTemplate.execution === 'back') as boolean
                    })
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
        macros: state.macros,
    }),
    {
        fetchMacros,
        getMacro,
    }
)

export default connector(MacroSelect)
