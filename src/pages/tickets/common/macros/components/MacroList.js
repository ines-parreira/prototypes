import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Input} from 'reactstrap'
import _debounce from 'lodash/debounce'

import shortcutManager from '../../../../../services/shortcutManager'
import {moveIndex, scrollToReactNode} from '../../../../common/utils/keyboard'
import {getActionTemplate} from '../../../../../utils'

import * as search from '../../../../../state/macro/search'

import css from './MacroList.less'

export default class MacroList extends React.Component {
    static propTypes = {
        macros: PropTypes.object.isRequired,
        currentMacro: PropTypes.object,
        disableExternalActions: PropTypes.bool,
        handleClickItem: PropTypes.func.isRequired,
    }

    state = {
        searchQuery: '',
        searchedMacrosIds: fromJS([]),
    }

    _macroCursor = 0
    _activeMacro = null

    componentDidMount() {
        shortcutManager.bind('MacroModal', {
            GO_NEXT_MACRO: {
                action: (e) => {
                    e.preventDefault()
                    this._moveCursor()
                }
            },
            GO_PREV_MACRO: {
                action: (e) => {
                    e.preventDefault()
                    this._moveCursor('previous')
                }
            },
        })
    }

    componentDidUpdate(prevProps, prevState) {
        const macros = this._getMacros().filter(macro => !this._isMacroDisabled(macro))
        const macrosIds = macros.map(macro => macro.get('id'))
        const previousMacros = this._getMacros(prevProps, prevState).filter(macro => !this._isMacroDisabled(macro))
        const previousMacrosIds = previousMacros.map(macro => macro.get('id'))

        // when macros change, select first one
        if (!macros.isEmpty() && !macrosIds.equals(previousMacrosIds)) {
            const firstMacroId = macros.first().get('id')
            this.props.handleClickItem(firstMacroId)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentMacro) {
            const macros = this._getMacros(nextProps)
            this._macroCursor = this._getMacroCursor(nextProps.currentMacro, macros)
        }
    }

    componentWillUnmount() {
        shortcutManager.unbind('MacroModal')
    }

    _getMacroCursor(currentMacro, macros) {
        return macros.findIndex((macro) => macro.get('id') === currentMacro.get('id'))
    }

    _moveCursor = (direction: string = 'next') => {
        const macros = this._getMacros()
        this._macroCursor = moveIndex(this._macroCursor, macros.size, {
            direction,
            rotate: true
        })
        const macro = macros.get(this._macroCursor)
        // skip disabled macros
        if (this._isMacroDisabled(macro)) {
            return this._moveCursor(direction)
        }

        this._selectCursorMacro(macro.get('id'))
    }

    _selectCursorMacro = _debounce((macroId) => {
        this.props.handleClickItem(macroId)

        if (this._activeMacro) {
            scrollToReactNode(this._activeMacro)
        }
    })

    _getMacros = (props = this.props, state = this.state) => {
        if (state.searchQuery) {
            return state.searchedMacrosIds.map((macroId) =>
                props.macros.find((m) =>
                    m.get('id').toString() === macroId
                )
            )
        }
        return props.macros
    }

    _handleSearch = (query) => {
        this.setState({searchQuery: query})
        if (!!query) {
            this.setState({searchedMacrosIds: fromJS(search.search(query))})
        }
    }

    _isMacroDisabled = (macro) => {
        if (!this.props.disableExternalActions) {
            return false
        }

        return macro
            .get('actions', fromJS([]))
            .some(action => getActionTemplate(action.get('name')).execution === 'back')
    }

    render() {
        const {currentMacro} = this.props
        const macros = this._getMacros()

        return (
            <div>
                <div className="macro-list">
                    <div
                        className="mt-3 mb-2"
                        style={{
                            position: 'relative',
                        }}
                    >
                        <Input
                            value={this.state.searchQuery}
                            onChange={e => this._handleSearch(e.target.value)}
                            placeholder="Search macros by name, tags or body..."
                            autoFocus={!this.props.macros.isEmpty()}
                            className={classnames(css.search, 'shortcuts-enable')}
                        />
                    </div>
                    {macros.map((macro) => {
                        const isDisabled = this._isMacroDisabled(macro)
                        const isActive = currentMacro && macro.get('id') === currentMacro.get('id')

                        return (
                            <div
                                key={macro.get('id')}
                                className={classnames('macro-item m-0', {
                                    active: isActive,
                                    disabled: isDisabled,
                                })}
                                onClick={() => {
                                    if (isDisabled) {
                                        return
                                    }

                                    this.props.handleClickItem(macro.get('id'))
                                }}
                                ref={(ref) => {
                                    if (isActive) {
                                        this._activeMacro = ref
                                    }
                                }}
                            >
                                {macro.get('name')}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

