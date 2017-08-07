import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {Input} from 'reactstrap'

import TicketReply from './TicketReply'
import TicketMacros from './TicketMacros'
import {onlySignature} from '../../../../../state/newMessage/responseUtils'

import * as search from '../../../../../state/macro/search'
import * as ticketActions from '../../../../../state/ticket/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getPreferences} from './../../../../../state/currentUser/selectors'
import MacroContainer from '../../../common/macros/MacroContainer'

const CONTENT_STATE_PATH = ['state', 'contentState']

export class TicketReplyArea extends React.Component {
    constructor(props) {
        super(props)

        const macros = this._getMacros(props, {})
        const firstMacro = macros.first()
        const selectedMacroId = firstMacro ? firstMacro.get('id') : null

        this.state = {
            searchQuery: '',
            searchedMacrosIds: fromJS([]),
            selectedMacroId,
        }
    }

    componentDidMount() {
        search.populate(this.props.macros.get('items'))

        if (this.props.newMessage.getIn(CONTENT_STATE_PATH) === null) {
            this._setMacrosVisible(this.props.newMessageType === 'email')
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const macrosIds = this._getMacrosIds()

        // when macros change because of a search then select first one
        const shouldSelectFirstMacro = !macrosIds.isEmpty()
            && this.state.searchQuery !== prevState.searchQuery

        if (shouldSelectFirstMacro) {
            this.setState({selectedMacroId: macrosIds.first()})
        }
    }

    componentWillReceiveProps(nextProps) {
        const prevContentState = this.props.newMessage.getIn(CONTENT_STATE_PATH)
        const nextContextState = nextProps.newMessage.getIn(CONTENT_STATE_PATH)

        // here we make sure that we only toggle the macros
        // if the current contentState is null.
        if (prevContentState === null && this.props.newMessageType === 'email') {
            // default
            let showMacros = nextProps.preferences.get('show_macros')

            // show/hide macros depending on the profile setting
            const preferences = nextProps.currentUser
                .get('settings')
                .find((s) => s.get('type') === 'preferences')

            if (preferences) {
                showMacros = preferences.getIn(['data', 'show_macros'])
            }

            // macros are hidden if there is more text than the signature
            const shouldHideMacros = (
                nextContextState &&
                nextContextState.hasText() && !onlySignature(nextContextState, nextProps.currentUser)
            )

            if (shouldHideMacros) {
                showMacros = false
            }

            this._setMacrosVisible(showMacros)
        }
    }

    _applyMacro = (macro) => {
        this.props.applyMacro(macro, this.props.ticket.get('id'))
    }

    _getMacros = (props = this.props, state = this.state) => {
        const macros = props.macros.get('items')
        if (state.searchQuery) {
            return state.searchedMacrosIds.map((macroId) =>
                macros.find((m) =>
                    m.get('id').toString() === macroId
                )
            )
        }
        return macros
    }

    _getMacrosIds = (props = this.props, state = this.state) => {
        return this._getMacros(props, state).map((macro) => macro.get('id')).toList()
    }

    _setMacrosVisible = (v) => this.props.actions.macro.setMacrosVisible(v)

    _handleSearch = (query) => {
        this.setState({searchQuery: query})
        if (!!query) {
            this.setState({searchedMacrosIds: fromJS(search.search(query))})
        }
    }

    // scroll in macro list until currently selected macro
    _scrollMacrosListToCurrent = () => {
        const list = document.getElementsByClassName('macro-list')[0]
        const selectedItem = document.getElementsByClassName('macro-item active')[0]
        list.scrollTop = selectedItem.offsetTop - 14
    }

    _handleSearchKeyDown = (e) => {
        const macros = this._getMacros()
        const macrosIds = this._getMacrosIds()
        const indexCurrentMacro = macrosIds.indexOf(this.state.selectedMacroId)

        if (e.key === 'ArrowDown') {
            if (~indexCurrentMacro && indexCurrentMacro < macrosIds.size - 1) {
                e.preventDefault()
                const nextMacroIndex = indexCurrentMacro + 1
                this.setState({selectedMacroId: macrosIds.get(nextMacroIndex)}, this._scrollMacrosListToCurrent)
            }
        }

        if (e.key === 'ArrowUp') {
            if (~indexCurrentMacro && indexCurrentMacro > 0) {
                e.preventDefault()
                const nextMacroIndex = indexCurrentMacro - 1
                this.setState({selectedMacroId: macrosIds.get(nextMacroIndex)}, this._scrollMacrosListToCurrent)
            }
        }

        if (e.key === 'Enter') {
            e.preventDefault()
            const macro = macros.find(macro => macro.get('id') === this.state.selectedMacroId)
            this._applyMacro(macro)
        }
    }

    render = () => {
        const macros = this.props.macros.set('items', this._getMacros())

        // don't steal focus in New Ticket
        const isNewTicket = !this.props.ticket.get('id')
        const macrosVisible = macros.get('visible')

        return (
            <div
                className={classnames('TicketReplyArea', {
                    'TicketReplyArea-macros-visible': macrosVisible
                })}
            >
                <div className="TicketReplyArea-search">
                    <Input
                        tabIndex="3"
                        onFocus={() => this._setMacrosVisible(true)}
                        onChange={(e) => this._handleSearch(e.target.value)}
                        onKeyDown={this._handleSearchKeyDown}
                        className="shortcuts-enable"
                        placeholder="Search macros by name, tags or body..."
                        autoFocus={macrosVisible && !isNewTicket}
                    />
                </div>

                <div className="TicketReplyArea-content">
                    <TicketMacros
                        macros={macros}
                        applyMacro={this.props.applyMacro}
                        openModal={this.props.openModal}
                        setMacrosVisible={this._setMacrosVisible}
                        searchQuery={this.state.searchQuery}
                        selectedMacroId={this.state.selectedMacroId}
                        setSelectedMacroId={(selectedMacroId) => this.setState({selectedMacroId})}
                    />

                    <TicketReply
                        className={classnames({
                            hidden: macrosVisible,
                        })}
                        actions={this.props.actions}
                        ticket={this.props.ticket}
                        appliedMacro={this.props.ticket.getIn(['state', 'appliedMacro'])}
                        users={this.props.users}
                        autoFocus={!macrosVisible}
                    />
                </div>

                <MacroContainer
                    selectedMacroIdOnOpen={this.state.selectedMacroId}
                />
            </div>
        )
    }
}

TicketReplyArea.propTypes = {
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    macros: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    applyMacro: PropTypes.func.isRequired,
    updateMacro: PropTypes.func,
    openModal: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired,
    newMessage: PropTypes.object.isRequired,
    newMessageType: PropTypes.string.isRequired,
}

function mapStateToProps(state) {
    return {
        newMessageType: newMessageSelectors.getNewMessageType(state),
        newMessage: state.newMessage,
        preferences: getPreferences(state)
    }
}

const mapDispatchToProps = {
    applyMacro: ticketActions.applyMacro,
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketReplyArea)
