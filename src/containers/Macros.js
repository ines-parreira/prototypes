import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import MacroModal from './../components/macro/MacroModal'
import * as MacroActions from './../actions/macro'
import * as TicketsActions from './../actions/tickets'
import { getMacrosWithoutExternalActions } from './../reducers/macros'

class MacrosContainer extends React.Component {
    componentWillReceiveProps(nextProps) {
        if (!this.props.macros.get('isModalOpen') &&
            nextProps.macros.get('isModalOpen') &&
            !nextProps.macros.get('items').size
        ) {
            this.props.actions.macro.fetchMacros()
        }

        if (
            nextProps.selectionMode && ( // only in preview mode
                (!this.props.macros.get('items').size && nextProps.macros.get('items').size) || // if we just loaded the items
                (!this.props.macros.get('isModalOpen') && nextProps.macros.get('isModalOpen') && nextProps.macros.get('items').size) // or if we already had the items and just opened the modal
            )
        ) {
            // set the first macro without external actions as 'selected'
            nextProps.actions.macro.previewMacroInModal(
                getMacrosWithoutExternalActions(nextProps.macros.get('items')).first().get('id')
            )
        }
    }

    render() {
        const { macros, tags, agents, actions, disableExternalActions, selectionMode, selected } = this.props

        if (!macros.get('isModalOpen')) {
            return null
        }

        return (
            <MacroModal
                macros={macros.get('items')}
                newMacro={macros.get('newMacro')}
                currentMacro={macros.get('modalSelected')}
                tags={tags.get('items')}
                agents={agents}
                actions={actions}
                disableExternalActions={disableExternalActions || false}
                selectionMode={selectionMode || false}
                selected={selected}
                noUnbind={this.props.noUnbind}
            />
        )
    }
}


MacrosContainer.propTypes = {
    macros: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,

    disableExternalActions: PropTypes.bool,
    selectionMode: PropTypes.bool,
    selected: PropTypes.object,

    noUnbind: PropTypes.bool
}

function mapStateToProps(state) {
    return {
        macros: state.macros,
        tags: state.tags,
        agents: state.users.get('agents')
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            macro: bindActionCreators(MacroActions, dispatch),
            tickets: bindActionCreators(TicketsActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MacrosContainer)
