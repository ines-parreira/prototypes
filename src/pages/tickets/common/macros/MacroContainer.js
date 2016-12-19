import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import MacroModal from './components/MacroModal'
import * as ViewsActions from '../../../../state/views/actions'
import * as MacroActions from '../../../../state/macro/actions'
import {getMacrosWithoutExternalActions} from '../../../../state/macro/utils'
import {getAgents} from '../../../../state/users/selectors'

class MacroContainer extends React.Component {
    componentWillReceiveProps(nextProps) {
        if (!this.props.macros.get('isModalOpen') &&
            nextProps.macros.get('isModalOpen') && !nextProps.macros.get('items').size
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
            const selectedMacro = getMacrosWithoutExternalActions(nextProps.macros.get('items')).first()

            if (selectedMacro) {
                nextProps.actions.macro.previewMacroInModal(selectedMacro.get('id'))
            }
        }
    }

    render() {
        const {
            activeView,
            macros,
            agents,
            actions,
            disableExternalActions,
            selectionMode,
            selectedItemsIds
        } = this.props

        if (!macros.get('isModalOpen')) {
            return null
        }

        return (
            <MacroModal
                loading={macros.getIn(['_internal', 'loading'])}
                activeView={activeView}
                macros={macros.get('items')}
                newMacro={macros.get('newMacro')}
                currentMacro={macros.get('modalSelected')}
                agents={agents}
                actions={actions}
                disableExternalActions={disableExternalActions || false}
                selectionMode={selectionMode || false}
                selectedItemsIds={selectedItemsIds}
            />
        )
    }
}


MacroContainer.propTypes = {
    activeView: PropTypes.object,
    macros: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,

    disableExternalActions: PropTypes.bool,
    selectionMode: PropTypes.bool,
    selectedItemsIds: PropTypes.object
}

MacroContainer.defaultProps = {
    activeView: fromJS({})
}

function mapStateToProps(state) {
    return {
        macros: state.macros,
        agents: getAgents(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            views: bindActionCreators(ViewsActions, dispatch),
            macro: bindActionCreators(MacroActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MacroContainer)
