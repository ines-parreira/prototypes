import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import MacroModal from './components/MacroModal'
import * as ViewsActions from '../../../../state/views/actions'
import * as MacroActions from '../../../../state/macro/actions'
import {getAgents} from '../../../../state/users/selectors'
import {orderByName} from '../../../../state/macro/utils'

class MacroContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedMacroId: this._defaultSelectedMacroId(props),
        }
    }

    componentDidUpdate(prevProps) {
        const items = this.props.macros.get('items', fromJS([]))
        const itemsIds = items.map(item => item.get('id'))
        const currentMacro = items.find(macro => macro.get('id') === this.state.selectedMacroId) || fromJS({})

        if (items.isEmpty()) {
            if (this.state.selectedMacroId) { // if there are no macros but there is a selected macro, deselect it
                this.setState({selectedMacroId: null})
            }
        } else {
            // if current macro does not exist in list anymore (list changed, deleted, etc.), select first of list
            if (currentMacro.isEmpty()) {
                const firstMacroId = items.first().get('id')
                this.setState({selectedMacroId: firstMacroId})
            } else if (!itemsIds.equals(prevProps.macros.get('items', fromJS([])).map(item => item.get('id')))) {
                // when macros list changes, select first of list
                const firstMacroId = items.first().get('id')
                this.setState({selectedMacroId: firstMacroId})
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        // modal opens
        if (!this._isOpen() && this._isOpen(nextProps)) {
            this.props.actions.macro.fetchMacros()
            this.setState({selectedMacroId: this._defaultSelectedMacroId(nextProps)})
        }
    }

    _handleClickItem = (macroId) => {
        this.setState({selectedMacroId: macroId})
    }

    _defaultSelectedMacroId = (props = this.props) => {
        let selectedMacroId = null

        if (props.selectedMacroIdOnOpen) {
            selectedMacroId = props.selectedMacroIdOnOpen
        } else {
            const firstMacro = props.macros.get('items', fromJS([])).first()

            if (firstMacro) {
                selectedMacroId = firstMacro.get('id')
            }
        }

        return selectedMacroId
    }

    _isOpen = (props = this.props) => {
        return props.macros.get('isModalOpen')
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

        const isOpen = this._isOpen()

        // important to keep, we want the MacroModal component to mount only if it is open
        // check lifecycle of shortcutManager
        if (!isOpen) {
            return null
        }

        const items = orderByName(macros.get('items'))
        const currentMacro = items.find(macro => macro.get('id') === this.state.selectedMacroId) || fromJS({})

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
    selectedItemsIds: PropTypes.object,
    selectedMacroIdOnOpen: PropTypes.number, // macro to select when modal opens, selects first macro of list otherwise
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
