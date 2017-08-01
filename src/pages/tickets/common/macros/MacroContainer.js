import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import MacroModal from './components/MacroModal'
import * as ViewsActions from '../../../../state/views/actions'
import * as MacroActions from '../../../../state/macro/actions'
import {getAgents} from '../../../../state/users/selectors'

class MacroContainer extends React.Component {
    constructor(props) {
        super(props)

        const firstMacro = props.macros.get('items', fromJS([])).first()
        const selectedMacroId = firstMacro ? firstMacro.get('id') : null

        this.state = {
            selectedMacroId,
        }
    }

    componentDidUpdate(prevProps) {
        const items = this.props.macros.get('items', fromJS([]))
        const itemsIds = items.map(item => item.get('id'))
        const currentMacro = items.get(this.state.selectedMacroId) || fromJS({})

        if (items.isEmpty()) {
            if (this.state.selectedMacroId) { // if there are no macros but there is a selected macro, deselect it
                this.setState({selectedMacroId: null})
            }
        } else {
            if (currentMacro.isEmpty()) { // if current macro does not exist in list anymore (list changed, deleted, etc.), select first of list
                const firstMacroId = items.first().get('id')
                this.setState({selectedMacroId: firstMacroId})
            } else if (!itemsIds.equals(prevProps.macros.get('items', fromJS([])).map(item => item.get('id')))) { // when macros list change, select first of list
                const firstMacroId = items.first().get('id')
                this.setState({selectedMacroId: firstMacroId})
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.macros.get('isModalOpen') &&
            nextProps.macros.get('isModalOpen') && !nextProps.macros.get('items').size
        ) {
            this.props.actions.macro.fetchMacros()
        }
    }

    _handleClickItem = (macroId) => {
        this.setState({selectedMacroId: macroId})
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

        const isOpen = macros.get('isModalOpen')

        // important to keep, we want the MacroModal component to mount only if it is open
        // check lifecycle of shortcutManager
        if (!isOpen) {
            return null
        }

        const items = macros.get('items')
        const currentMacro = items.get(this.state.selectedMacroId) || fromJS({})

        return (
            <MacroModal
                isOpen={isOpen}
                activeView={activeView}
                macros={items}
                newMacro={macros.get('newMacro')}
                currentMacro={currentMacro}
                agents={agents}
                actions={actions}
                disableExternalActions={disableExternalActions || false}
                selectionMode={selectionMode || false}
                selectedItemsIds={selectedItemsIds}
                handleClickItem={this._handleClickItem}
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
