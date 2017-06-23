import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {getActionTemplate} from '../../../../../utils'

import InputField from '../../../../common/forms/InputField'

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
            <div>
                <div className="macro-list p-0">
                    <InputField
                        value={this.state.searchTerm}
                        onChange={this.searchUpdated}
                        className="mt-3 shortcuts-enable"
                        placeholder="Search a macro..."
                    />
                    {
                        curMacros.map(macro => {
                            let isDisabled = false

                            if (disableExternalActions) {
                                isDisabled = macro
                                    .get('actions', fromJS([]))
                                    .some(action => getActionTemplate(action.get('name')).execution === 'back')
                            }

                            return (
                                <div
                                    key={macro.get('id')}
                                    className={classnames('macro-item m-0', {
                                        active: currentMacro && macro.get('id') === currentMacro.get('id'),
                                        disabled: isDisabled,
                                    })}
                                    onClick={isDisabled ? _noop : () => actions.previewMacroInModal(macro.get('id'))}
                                >
                                    {macro.get('name')}
                                </div>
                            )
                        }).toList()
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
