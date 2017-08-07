import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Input} from 'reactstrap'

import {getActionTemplate} from '../../../../../utils'
import * as search from '../../../../../state/macro/search'

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
                <div className="macro-list p-0">
                    <div
                        className="mt-3 mb-2"
                        style={{
                            position: 'relative',
                        }}
                    >
                        <Input
                            value={this.state.searchQuery}
                            onChange={e => this._handleSearch(e.target.value)}
                            className="shortcuts-enable"
                            placeholder="Search macros by name, tags or body..."
                        />
                    </div>
                    {macros.map((macro) => {
                        const isDisabled = this._isMacroDisabled(macro)

                        return (
                            <div
                                key={macro.get('id')}
                                className={classnames('macro-item m-0', {
                                    active: currentMacro && macro.get('id') === currentMacro.get('id'),
                                    disabled: isDisabled,
                                })}
                                onClick={() => {
                                    if (isDisabled) {
                                        return
                                    }

                                    this.props.handleClickItem(macro.get('id'))
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

