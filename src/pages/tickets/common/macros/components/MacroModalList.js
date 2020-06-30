// @flow
import React from 'react'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {Input} from 'reactstrap'

import shortcutManager from '../../../../../services/shortcutManager'
import {moveIndex} from '../../../../common/utils/keyboard'
import {isMacroDisabled} from '../utils'

import {fetchMacros} from '../../../../../state/macro/actions'

import css from './MacroModalList.less'

import MacroList from './MacroList'

type Props = {
    macros: Object,
    currentMacro: Object,
    disableExternalActions?: boolean,
    handleClickItem: Function,
    fetchMacros: typeof fetchMacros,
    page: number,
    totalPages: number,
    search: string,
    onSearch: (T: {target: {value: string}}) => void,
}

export default class MacroModalList extends React.Component<Props> {
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
                    this._moveCursor('previous')
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

    _getMacroCursor(currentMacro: Object, macros: Object) {
        return macros.findIndex(
            (macro) => macro.get('id') === currentMacro.get('id')
        )
    }

    _moveCursor = (direction: string = 'next') => {
        if (this.props.macros.isEmpty()) {
            return
        }

        const macros = this.props.macros
        this._macroCursor = moveIndex(this._macroCursor, macros.size, {
            direction: direction === 'next' ? 'next' : 'previous',
        })
        const macro = macros.get(this._macroCursor)
        // skip disabled macros
        if (isMacroDisabled(macro, this.props.disableExternalActions)) {
            this._moveCursor(direction)
            return
        }

        this._selectCursorMacro(macro.get('id'))
    }

    _selectCursorMacro = _debounce((macroId) => {
        this.props.handleClickItem(macroId)
    })

    render() {
        const {
            currentMacro,
            macros,
            page,
            totalPages,
            fetchMacros,
            disableExternalActions,
            handleClickItem,
            search,
            onSearch,
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
                    onClickItem={(macro) => handleClickItem(macro.get('id'))}
                />
            </div>
        )
    }
}
