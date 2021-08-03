import React, {Component} from 'react'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {Input} from 'reactstrap'
import {List, Map} from 'immutable'

import shortcutManager from '../../../../../services/shortcutManager'
import {moveIndex, MoveIndexDirection} from '../../../../common/utils/keyboard'
import {isMacroDisabled} from '../utils'
import {fetchMacrosParamsTypes} from '../../../../../state/macro/actions'

import css from './MacroModalList.less'

import MacroList from './MacroList'

type Props = {
    macros: List<any>
    currentMacro: Map<any, any>
    disableExternalActions?: boolean
    handleClickItem: (id: number) => void
    fetchMacros: (params: fetchMacrosParamsTypes) => Promise<void>
    page: number
    totalPages: number
    search: string
    onSearch: (T: {
        target: {
            value: string
        }
    }) => void
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
            nextProps.macros
        )
    }

    _getMacroCursor(currentMacro: Map<any, any>, macros: List<any>) {
        return macros.findIndex(
            (macro: Map<any, any>) => macro.get('id') === currentMacro.get('id')
        )
    }

    _moveCursor = (direction = MoveIndexDirection.Next) => {
        if (this.props.macros.isEmpty()) {
            return
        }

        const macros = this.props.macros
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
            macros,
            page,
            totalPages,
            disableExternalActions,
            handleClickItem,
            search,
            onSearch,
            fetchMacros,
        } = this.props

        return (
            <div className={css.component}>
                <div className="mt-3 mb-2">
                    <Input
                        value={search}
                        onChange={onSearch}
                        placeholder="Search macros by name, tags or body..."
                        autoFocus={!this.props.macros.isEmpty()}
                        className={classnames(css.search, 'shortcuts-enable')}
                    />
                </div>
                <MacroList
                    className={css.scroller}
                    macros={macros}
                    page={page}
                    totalPages={totalPages}
                    fetchMacros={fetchMacros}
                    search={search}
                    currentMacro={currentMacro}
                    disableExternalActions={disableExternalActions}
                    onClickItem={(macro: Map<any, any>) =>
                        handleClickItem(macro.get('id'))
                    }
                />
            </div>
        )
    }
}
