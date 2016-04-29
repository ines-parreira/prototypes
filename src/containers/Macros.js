import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import MacrosModal from './../components/macro/MacrosModal'
import * as MacroActions from './../actions/macro'

class MacrosContainer extends React.Component {
    render() {
        const { macros, tags, agents, actions } = this.props

        if (!macros.get('isModalOpen')) {
            return null
        }

        return (
            <MacrosModal
                macros={macros.get('items')}
                newMacro={macros.get('newMacro')}
                currentMacro={macros.get('modalSelected')}
                tags={tags.get('items')}
                agents={agents}
                actions={actions}
            />
        )
    }
}


MacrosContainer.propTypes = {
    macros: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
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
        actions: bindActionCreators(MacroActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MacrosContainer)
