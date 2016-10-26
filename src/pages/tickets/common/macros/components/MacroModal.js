import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'

import MacroList from './MacroList'
import MacroEdit from './MacroEdit'
import MacroPreview from './MacroPreview'
import * as mousetrap from 'mousetrap'

export default class MacroModal extends React.Component {
    componentDidMount() {
        const {activeView, currentMacro, actions, selectionMode, selectedItemsIds} = this.props

        amplitude.getInstance().logEvent('Opened macro modal')

        $(this.refs.macroModal).modal({
            onHidden: actions.macro.closeModal
        }).modal('show')

        mousetrap.bind('up', (e) => {
            e.preventDefault()
            actions.macro.previewAdjacentMacroInModal('prev', this.props.disableExternalActions)
        })
        mousetrap.bind('down', (e) => {
            e.preventDefault()
            actions.macro.previewAdjacentMacroInModal('next', this.props.disableExternalActions)
        })

        if (selectionMode) {
            mousetrap.bind('mod+enter', (e) => {
                e.preventDefault()
                this.cancel()
                const value = currentMacro ? currentMacro.toJS() : null
                actions.views.bulkUpdate(activeView, selectedItemsIds, 'macro', value)
            })
        }
    }

    componentWillUnmount() {
        $(this.refs.macroModal).modal('hide')

        if (!this.props.noUnbind) {
            mousetrap.unbind('up')
            mousetrap.unbind('down')
            mousetrap.unbind('enter')
        }
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
                tags={this.props.tags}
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
    tags: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired,

    disableExternalActions: PropTypes.bool.isRequired,
    selectionMode: PropTypes.bool.isRequired,
    selectedItemsIds: PropTypes.object,

    noUnbind: PropTypes.bool
}

MacroModal.defaultProps = {
    activeView: fromJS({})
}
