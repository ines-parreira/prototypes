// @flow
//$FlowFixMe
import React, {useMemo, useState, useEffect} from 'react'
import {connect} from 'react-redux'
import {fromJS, List} from 'immutable'
import {type CancelTokenSource} from 'axios'

import {getActionTemplate} from '../../../../../utils'
import {fetchMacros, getMacro} from '../../../../../state/macro/actions'
import {useCancelToken} from '../../../../../hooks'
import {type State as MacrosState, Macro} from '../../../../../state/macro/types'

import Select from './ReactSelect'
import {useOptions} from './hooks'

type Props = {
    macros: MacrosState,
    actions: Object,
    fetchMacros: typeof fetchMacros,
    getMacro: typeof getMacro,
    onChange: (any) => void,
    value: string,
    className?: string
}

const MacroSelect = (props: Props) => {
    const {className, value, onChange, fetchMacros, getMacro, macros} = props
    const [isLoading, setIsLoading] = useState(false)
    const [searchResults, setSearchResults] = useState(fromJS([]))
    const [search, setSearch] = useState('')
    const selectedMacro: ?Macro = value ? macros.get(parseInt(value)) : null
    const macroOptions = useOptions(selectedMacro, searchResults, (macro) => macro.get('id'))

    useEffect( () => {
        if (selectedMacro) {
            return
        }
        getMacro(value)
    }, [selectedMacro])

    useCancelToken(async (source: CancelTokenSource) => {
        setIsLoading(true)
        const res = await fetchMacros({search}, '', 'asc', source.token)
        if (res) {
            setIsLoading(false)
            setSearchResults(res.macros)
        }
    }, [search])

    const options = useMemo((): List<*> => {
        if (isLoading) {
            return fromJS([])
        }
        // Filter out macros with external actions
        return macroOptions.filter((macro) => macro.get('actions')
            .filter((action) => getActionTemplate(action.get('name')).execution === 'back')
            .isEmpty()).map((macro) => fromJS({value: macro.get('id').toString(), label: macro.get('name')}))
            .toList()
            .sortBy((macro) => (macro.get('label') || '').toLowerCase())
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

//$FlowFixMe
export default connect((state) => ({
    macros: state.macros
}), {
    fetchMacros,
    getMacro
})(MacroSelect)
