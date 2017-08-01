import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {Input} from 'reactstrap'
import _debounce from 'lodash/debounce'

import {getActionTemplate} from '../../../../../utils'

import * as macroActions from '../../../../../state/macro/actions'

@connect(null, {
    searchMacros: macroActions.searchMacros,
})
export default class MacroList extends React.Component {
    static propTypes = {
        macros: PropTypes.object.isRequired,
        currentMacro: PropTypes.object,
        disableExternalActions: PropTypes.bool,
        handleClickItem: PropTypes.func.isRequired,
        searchMacros: PropTypes.func.isRequired,
    }

    state = {
        isSearching: false,
        searchTerm: '',
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
        if (state.searchTerm && !state.isSearching) {
            return props.macros.filter(macro => state.searchedMacrosIds.includes(macro.get('id')))
        }

        return props.macros
    }

    _handleSearch = (term) => {
        this.setState({searchTerm: term})
        if (!!term) {
            this.setState({isSearching: true})
        }
        return this._debouncedSearch(term)
    }

    _debouncedSearch = _debounce((term) => {
        return this.props.searchMacros(term).then((macros) => {
            this.setState({
                isSearching: false,
                searchedMacrosIds: macros.map(macro => macro.get('id')),
            })
        })
    }, 200)

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
                            value={this.state.searchTerm}
                            onChange={e => this._handleSearch(e.target.value)}
                            className="shortcuts-enable"
                            placeholder="Search a macro..."
                        />
                        <i
                            className={classnames('fa fa-fw fa-circle-o-notch fa-spin text-faded', {
                                hidden: !this.state.isSearching,
                            })}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '9px',
                            }}
                        />
                    </div>
                    {
                        this.state.isSearching ? (
                                <div className="macro-item m-0 disabled">
                                    <i>Searching...</i>
                                </div>
                            ) : (
                                macros.map(macro => {
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
                                }).toList()
                            )
                    }
                </div>
            </div>
        )
    }
}

