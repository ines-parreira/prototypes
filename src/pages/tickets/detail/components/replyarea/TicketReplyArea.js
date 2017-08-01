import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {Input} from 'reactstrap'
import _debounce from 'lodash/debounce'

import TicketReply from './TicketReply'
import TicketMacros from './TicketMacros'
import {onlySignature} from '../../../../../state/newMessage/responseUtils'

import * as macroActions from '../../../../../state/macro/actions'
import * as ticketActions from '../../../../../state/ticket/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getPreferences} from './../../../../../state/currentUser/selectors'

const CONTENT_STATE_PATH = ['state', 'contentState']

export class TicketReplyArea extends React.Component {
    constructor(props) {
        super(props)

        const macros = this._getMacros(props, {})
        const firstMacro = macros.first()
        const selectedMacroId = firstMacro ? firstMacro.get('id') : null

        this.state = {
            isSearching: false,
            searchTerm: '',
            searchedMacrosIds: fromJS([]),
            selectedMacroId,
        }
    }

    componentDidMount() {
        if (this.props.newMessage.getIn(CONTENT_STATE_PATH) === null) {
            this._setMacrosVisible(this.props.newMessageType === 'email')
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const items = this._getMacros()

        // when macros change, select first one
        if (!items.isEmpty() && !items.equals(this._getMacros(prevProps, prevState))) {
            this.setState({selectedMacroId: items.first().get('id')})
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
        const macros = props.macros.get('items', fromJS([]))

        if (state.searchTerm && !state.isSearching) {
            return macros.filter(macro => state.searchedMacrosIds.includes(macro.get('id')))
        }

        return macros
    }

    _setMacrosVisible = v => this.props.actions.macro.setMacrosVisible(v)

    _handleSearch = (term) => {
        this.setState({searchTerm: term})
        if (!!term) {
            this.setState({isSearching: true})
            this._debouncedSearch(term)
        }
    }

    _debouncedSearch = _debounce((term) => {
        return this.props.searchMacros(term).then((macros) => {
            this.setState({
                isSearching: false,
                searchedMacrosIds: macros.map(macro => macro.get('id')),
            })
        })
    }, 300)

    // scroll in macro list until currently selected macro
    _scrollMacrosListToCurrent = () => {
        const list = document.getElementsByClassName('macro-list')[0]
        const selectedItem = document.getElementsByClassName('macro-item active')[0]
        list.scrollTop = selectedItem.offsetTop - 14
    }

    _handleSearchKeyDown = (e) => {
        const macros = this._getMacros()
        const macrosIds = macros.map(macro => macro.get('id')).toList()
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
            const macro = macros.get(this.state.selectedMacroId)
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
                        onChange={e => this._handleSearch(e.target.value)}
                        onKeyDown={this._handleSearchKeyDown}
                        className="shortcuts-enable"
                        placeholder="Search macro by title, text, tag, etc..."
                        autoFocus={macrosVisible && !isNewTicket}
                    />
                    <i
                        className={classnames('fa fa-fw fa-circle-o-notch fa-spin text-faded', {
                            hidden: !this.state.isSearching,
                        })}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '12px',
                        }}
                    />
                </div>

                <div className="TicketReplyArea-content">
                    <TicketMacros
                        macros={macros}
                        applyMacro={this.props.applyMacro}
                        openModal={this.props.openModal}
                        setMacrosVisible={this._setMacrosVisible}
                        isLoading={this.state.isSearching}
                        searchedTerm={this.state.searchTerm}
                        selectedMacroId={this.state.selectedMacroId}
                        setSelectedMacroId={selectedMacroId => this.setState({selectedMacroId})}
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
    searchMacros: PropTypes.func.isRequired,
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
    searchMacros: macroActions.searchMacros,
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketReplyArea)
