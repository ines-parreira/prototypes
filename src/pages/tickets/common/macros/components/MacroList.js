import React, {PropTypes} from 'react'
import Immutable from 'immutable'
import SearchInput from 'react-search-input'
import classnames from 'classnames'

import {getActionTemplate} from '../../../../../utils'

export default class MacroList extends React.Component {
    constructor() {
        super()
        this.state = {searchTerm: ''}
    }

    searchUpdated = (term) => {
        this.props.actions.saveSearch(term)
        this.setState({searchTerm: term}) // Necessary for re-render
    }

    renderCreateMacro() {
        if (this.props.selectionMode) {
            return null
        }

        return (
            <div className="button-wrapper">
                <div className="ui basic light blue fluid button" onClick={this.props.actions.addNewMacro}>Create macro</div>
            </div>
        )
    }

    render() {
        const { macros, currentMacro, actions, disableExternalActions } = this.props

        /**
         * Used to replace the list of all macros with the list of macros corresponding to the current search term,
         * if there is a current search term.
         */
        const curMacros = this.refs.search ? Immutable.fromJS(macros.valueSeq().toJS().filter(this.refs.search.filter(['name']))) : macros

        return (
            <div style={{ height: '100%' }}>
                <div className="ui secondary vertical fluid menu">
                    <div className="ui category search item">
                        <div className="ui icon input">
                            <SearchInput
                                ref="search"
                                onChange={this.searchUpdated}
                                className="ui icon input full-width prompt shortcuts-enable"
                                placeholder="Search for a macro"
                            />
                            <i className="search icon"/>
                        </div>
                    </div>
                    {
                        curMacros.map(macro => {
                            let isDisabled = false

                            if (disableExternalActions) {
                                macro.get('actions').forEach(action => {
                                    if (getActionTemplate(action.get('name')).execution === 'back') {
                                        isDisabled = true
                                    }
                                })
                            }

                            const props = {
                                key: macro.get('id'),
                                className: classnames('item', {
                                    active: currentMacro && macro.get('id') === currentMacro.get('id'),
                                    disabled: isDisabled
                                }),
                                onClick: isDisabled ? null : () => actions.previewMacroInModal(macro.get('id'))
                            }

                            return (
                                <a {...props}>
                                    {macro.get('name')}
                                </a>
                            )
                        }).toList().toJS()
                    }
                </div>
                {this.renderCreateMacro()}
            </div>
        )
    }
}

MacroList.propTypes = {
    macros: PropTypes.object.isRequired,
    currentMacro: PropTypes.object,
    actions: PropTypes.object.isRequired,
    disableExternalActions: PropTypes.bool,
    selectionMode: PropTypes.bool
}
