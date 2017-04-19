import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import SearchInput from 'react-search-input'
import classnames from 'classnames'

import {getActionTemplate} from '../../../../../utils'

export default class MacroList extends React.Component {
    state = {
        searchTerm: '',
    }

    searchUpdated = (term) => {
        this.props.actions.saveSearch(term)
        this.setState({searchTerm: term}) // Necessary for re-render
    }

    render() {
        const {macros, currentMacro, actions, disableExternalActions} = this.props

        /**
         * Used to replace the list of all macros with the list of macros corresponding to the current search term,
         * if there is a current search term.
         */
        const curMacros = fromJS(macros.valueSeq().toJS().filter((macro) => {
            return macro.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
        }))

        return (
            <div style={{height: '100%'}}>
                <div
                    className="ui secondary vertical fluid menu"
                    style={{margin: 0}}
                >
                    <div className="ui category search item">
                        <div className="ui icon input">
                            <SearchInput
                                value={this.state.searchTerm}
                                onChange={this.searchUpdated}
                                className="ui icon input full-width prompt shortcuts-enable"
                                placeholder="Search for a macro"
                            />
                            <i className="search icon" />
                        </div>
                    </div>
                    {
                        curMacros.map(macro => {
                            let isDisabled = false

                            if (disableExternalActions) {
                                isDisabled = macro
                                    .get('actions', fromJS([]))
                                    .some(action => getActionTemplate(action.get('name')).execution === 'back')
                            }

                            const props = {
                                key: macro.get('id'),
                                className: classnames('item', {
                                    active: currentMacro && macro.get('id') === currentMacro.get('id'),
                                    disabled: isDisabled
                                }),
                                onClick: isDisabled ? null : () => actions.previewMacroInModal(macro.get('id')),
                                style: {margin: '0'},
                            }

                            return (
                                <a {...props}>
                                    {macro.get('name')}
                                </a>
                            )
                        }).toList().toJS()
                    }
                </div>
            </div>
        )
    }
}

MacroList.propTypes = {
    macros: PropTypes.object.isRequired,
    currentMacro: PropTypes.object,
    actions: PropTypes.object.isRequired,
    disableExternalActions: PropTypes.bool,
}
