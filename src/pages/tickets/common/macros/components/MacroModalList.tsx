import React, {Component} from 'react'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {List, Map} from 'immutable'

import {fetchMacrosParamsTypes, MacrosSearchResult} from 'state/macro/actions'
import TextInput from 'pages/common/forms/input/TextInput'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import shortcutManager from '../../../../../services/shortcutManager'
import {moveIndex, MoveIndexDirection} from '../../../../common/utils/keyboard'
import {isMacroDisabled} from '../utils'

import css from './MacroModalList.less'

import MacroList from './MacroList'

type Props = {
    searchParams: fetchMacrosParamsTypes
    searchResults: MacrosSearchResult
    currentMacro: Map<any, any>
    disableExternalActions?: boolean
    handleClickItem: (id: number) => void
    fetchMacros: (params: fetchMacrosParamsTypes) => Promise<void>
    onSearch: (searchParams: fetchMacrosParamsTypes) => void
}

export default class MacroModalList extends Component<Props> {
    _macroCursor = 0

    componentDidMount() {
        shortcutManager.bind('MacroModal', {
            GO_NEXT_MACRO: {
                action: (e) => {
                    e.preventDefault()
                    this._moveCursor()
                },
            },
            GO_PREV_MACRO: {
                action: (e) => {
                    e.preventDefault()
                    this._moveCursor(MoveIndexDirection.Prev)
                },
            },
        })
    }

    componentWillUnmount() {
        shortcutManager.unbind('MacroModal')
    }

    componentWillReceiveProps(nextProps: Props) {
        this._macroCursor = this._getMacroCursor(
            nextProps.currentMacro,
            nextProps.searchResults.macros
        )
    }

    _getMacroCursor(currentMacro: Map<any, any>, macros: List<any>) {
        return macros.findIndex(
            (macro: Map<any, any>) => macro.get('id') === currentMacro.get('id')
        )
    }

    _moveCursor = (direction = MoveIndexDirection.Next) => {
        if (this.props.searchResults.macros.isEmpty()) {
            return
        }

        const macros = this.props.searchResults.macros
        this._macroCursor = moveIndex(this._macroCursor, macros.size, {
            direction:
                direction === MoveIndexDirection.Next
                    ? MoveIndexDirection.Next
                    : MoveIndexDirection.Prev,
        })
        const macro = macros.get(this._macroCursor) as Map<any, any>
        // skip disabled macros
        if (isMacroDisabled(macro, this.props.disableExternalActions)) {
            this._moveCursor(direction)
            return
        }

        this._selectCursorMacro(macro.get('id'))
    }

    _selectCursorMacro = _debounce((macroId: number) => {
        this.props.handleClickItem(macroId)
    })

    render() {
        const {
            currentMacro,
            searchParams,
            searchResults,
            disableExternalActions,
            handleClickItem,
            onSearch,
            fetchMacros,
        } = this.props

        return (
            <div className={css.component}>
                <TextInput
                    value={searchParams.search}
                    onChange={(value) =>
                        onSearch({...searchParams, search: value})
                    }
                    placeholder="Search macros by name, tags or body..."
                    autoFocus={!searchResults.macros.isEmpty()}
                    className={classnames(
                        css.search,
                        'shortcuts-enable',
                        'mt-3',
                        'mb-3'
                    )}
                />
                <MacroFilters
                    selectedProperties={{
                        languages: searchParams.languages,
                        tags: searchParams.tags,
                    }}
                    onChange={(values) =>
                        onSearch({
                            ...searchParams,
                            ...values,
                        })
                    }
                />
                <MacroList
                    className={css.scroller}
                    searchResults={searchResults}
                    loadMore={() =>
                        fetchMacros({
                            ...searchParams,
                            page: searchResults.page + 1,
                        })
                    }
                    currentMacro={currentMacro}
                    disableExternalActions={disableExternalActions}
                    onClickItem={(macro) => handleClickItem(macro.get('id'))}
                />
            </div>
        )
    }
}
