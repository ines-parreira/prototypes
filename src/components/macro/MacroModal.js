import React, {PropTypes} from 'react'

import MacroList from './MacroList'
import MacroEdit from './MacroEdit'
import MacroPreview from './MacroPreview'
import * as mousetrap from 'mousetrap'


export default class MacroModal extends React.Component {
    componentDidMount() {
        $('#macro-modal').modal({
            onHidden: this.props.actions.macro.closeModal
        }).modal('show')

        mousetrap.bind('up', (e) => {
            e.preventDefault()
            this.props.actions.macro.previewAdjacentMacroInModal('prev', this.props.disableExternalActions)
        })
        mousetrap.bind('down', (e) => {
            e.preventDefault()
            this.props.actions.macro.previewAdjacentMacroInModal('next', this.props.disableExternalActions)
        })

        if (this.props.selectionMode) {
            mousetrap.bind('mod+enter', (e) => {
                e.preventDefault()
                this.cancel()
                this.props.actions.tickets.bulkUpdate(this.props.selected, 'macro', this.props.currentMacro.toJS())
            })
        }
    }

    componentWillUnmount() {
        $('#macro-modal').modal('hide')

        if (!this.props.noUnbind) {
            mousetrap.unbind('up')
            mousetrap.unbind('down')
            mousetrap.unbind('enter')
        }
    }

    create() {
        this.props.actions.macro.createMacro(this.props.currentMacro)
        $('#macro-modal').modal('hide')
    }

    cancel() {
        $('#macro-modal').modal('hide')
    }

    deleteMacro() {
        if (confirm(`Do you really want to delete the macro ${this.props.currentMacro.get('name')} ?`)) {
            this.props.actions.macro.deleteMacro(this.props.currentMacro.get('id'))
        }
    }

    render() {
        const { macros, currentMacro, actions, selectionMode, selected } = this.props

        const rightPart = selectionMode ? (
            <MacroPreview
                currentMacro={currentMacro}
                apply={() => { this.cancel(); actions.tickets.bulkUpdate(selected, 'macro', currentMacro.toJS()) }}
                cancel={() => this.cancel()}
                selected={selected}
            />
        ) : (
            <MacroEdit
                currentMacro={currentMacro}
                tags={this.props.tags}
                agents={this.props.agents}
                actions={actions.macro}
                cancel={() => this.cancel()}
            />
        )

        return (
            <div id="macro-modal" className="MacroModal ui large modal">
                <i className="close icon"/>
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
    macros: PropTypes.object.isRequired,
    currentMacro: PropTypes.object,
    tags: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired,

    disableExternalActions: PropTypes.bool.isRequired,
    selectionMode: PropTypes.bool.isRequired,
    selected: PropTypes.object,

    noUnbind: PropTypes.bool
}
