import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'

import MacroList from './MacroList'
import MacroEdit from './MacroEdit'
import MacroPreview from './MacroPreview'
import shortcutManager from '../../../../common/utils/shortcutManager'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'

export default class MacroModal extends React.Component {
    componentDidMount() {
        logEvent('Opened macro modal')

        $(this.refs.macroModal).modal({
            onHidden: this.props.actions.macro.closeModal
        }).modal('show')

        shortcutManager.bind('MacroModal', {
            PREVIEW_PREV_MACRO: {
                action: (e) => {
                    e.preventDefault()
                    this.props.actions.macro.previewAdjacentMacroInModal('prev', this.props.disableExternalActions)
                }
            },
            PREVIEW_NEXT_MACRO: {
                action: (e) => {
                    e.preventDefault()
                    this.props.actions.macro.previewAdjacentMacroInModal('next', this.props.disableExternalActions)
                }
            },
            APPLY_MACRO: {
                action: (e) => {
                    if (!this.props.selectionMode) {
                        return
                    }

                    e.preventDefault()
                    this.cancel()
                    this.props.actions.tickets.bulkUpdate(this.props.selectedItemsIds, 'macro', this.props.currentMacro.toJS())
                }
            }
        })
    }

    componentWillUnmount() {
        $(this.refs.macroModal).modal('hide')

        shortcutManager.unbind('MacroModal')
    }

    cancel = () => {
        $(this.refs.macroModal).modal('hide')
    }

    render() {
        const {loading, activeView, macros, currentMacro, actions, selectionMode, selectedItemsIds } = this.props

        const rightPart = selectionMode ? (
            <MacroPreview
                currentMacro={currentMacro}
                apply={() => {
                    this.cancel()
                    const value = currentMacro ? currentMacro.toJS() : null
                    actions.views.bulkUpdate(activeView, selectedItemsIds, 'macro', value)
                }}
                cancel={this.cancel}
                selectedItemsIds={selectedItemsIds}
            />
        ) : (
            <MacroEdit
                loading={loading}
                currentMacro={currentMacro}
                agents={this.props.agents}
                actions={actions.macro}
                cancel={this.cancel}
            />
        )

        return (
            <div
                ref="macroModal"
                className="MacroModal ui large modal"
            >
                <i className="close icon" />
                <div className="header">
                    {selectionMode ? 'Macros' : 'Manage macros'}
                </div>
                <div className="ui grid container">
                    <div className="five wide left column">
                        <MacroList
                            macros={macros}
                            currentMacro={currentMacro}
                            actions={actions.macro}
                            disableExternalActions={this.props.disableExternalActions}
                            selectionMode={selectionMode}
                        />
                    </div>
                    <div className="eleven wide right column">
                        {rightPart}
                    </div>
                </div>
            </div>
        )
    }
}

MacroModal.propTypes = {
    loading: PropTypes.object.isRequired,
    activeView: PropTypes.object,
    macros: PropTypes.object.isRequired,
    currentMacro: PropTypes.object,
    agents: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired,

    disableExternalActions: PropTypes.bool.isRequired,
    selectionMode: PropTypes.bool.isRequired,
    selectedItemsIds: PropTypes.object
}

MacroModal.defaultProps = {
    activeView: fromJS({})
}
