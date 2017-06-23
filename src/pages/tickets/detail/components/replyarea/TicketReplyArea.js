import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Input} from 'reactstrap'

import TicketReply from './TicketReply'
import TicketMacros from './TicketMacros'
import {onlySignature} from '../../../../../state/newMessage/responseUtils'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getPreferences} from './../../../../../state/currentUser/selectors'

const CONTENT_STATE_PATH = ['state', 'contentState']

export class TicketReplyArea extends React.Component {
    constructor() {
        super()
        this.state = {searchTerm: ''}
    }

    componentDidMount() {
        window.addEventListener('keydown', this._hideMacros)

        if (this.props.newMessage.getIn(CONTENT_STATE_PATH) === null) {
            this._setMacrosVisible(this.props.newMessageType === 'email')
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

    componentWillUnmount() {
        window.removeEventListener('keydown', this._hideMacros)
    }

    _setMacrosVisible = v => this.props.actions.macro.setMacrosVisible(v)

    _hideMacros = (e) => {
        if (e.key === 'Escape' && !this.props.macros.get('isModalOpen')) {
            this._setMacrosVisible(false)
        }
    }

    _searchUpdated = (term) => {
        this.props.actions.macro.saveSearch(term)
        this.setState({searchTerm: term}) // Necessary for re-render
    }

    render = () => {
        let {macros} = this.props
        // don't steal focus in New Ticket
        const isNewTicket = !this.props.ticket.get('id')
        const macrosVisible = macros.get('visible')

        if (this.state.searchTerm && !macros.get('items').isEmpty()) {
            macros = macros.update('items', items => {
                return items.filter(item => item.get('name', '').toLowerCase().includes(this.state.searchTerm.toLowerCase()))
            })
        }

        return (
            <div className={classnames('TicketReplyArea', {
                'TicketReplyArea-macros-visible': macrosVisible
            })}>
                <div className="TicketReplyArea-search">
                    <Input
                        tabIndex="3"
                        onFocus={() => this._setMacrosVisible(true)}
                        onChange={e => this._searchUpdated(e.target.value)}
                        className="shortcuts-enable"
                        placeholder="Search for a macro..."
                        autoFocus={macrosVisible && !isNewTicket}
                    />
                </div>

                <div className="TicketReplyArea-content">
                    <TicketMacros
                        macros={macros}
                        applyMacro={this.props.applyMacro}
                        previewMacro={this.props.previewMacro}
                        previewMacroInModal={this.props.previewMacroInModal}
                        openModal={this.props.openModal}
                        setMacrosVisible={this._setMacrosVisible}
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
    previewMacro: PropTypes.func.isRequired,
    updateMacro: PropTypes.func,
    previewMacroInModal: PropTypes.func.isRequired,
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

export default connect(mapStateToProps)(TicketReplyArea)
