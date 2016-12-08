import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classNames from 'classnames'
import TicketReply from './TicketReply'
import TicketMacros from './TicketMacros'
import SearchInput from 'react-search-input'
import {onlySignature} from '../../../../../state/ticket/responseUtils'

const CONTENT_STATE_PATH = ['state', 'contentState']

export default class TicketReplyArea extends React.Component {
    constructor() {
        super()
        this.state = {searchTerm: ''}
    }

    componentDidMount() {
        $(this.refs.popupClearMacros).popup({
            inline: true,
            variation: 'inverted',
            position: 'top right',
            hoverable: true,
            on: 'hover'
        })
        window.addEventListener('keydown', this._hideMacros)

        if (this.props.ticket.getIn(CONTENT_STATE_PATH) === null) {
            this._setMacrosVisible(true)
        }
    }

    componentWillReceiveProps(nextProps) {
        const prevContentState = this.props.ticket.getIn(CONTENT_STATE_PATH)
        const nextContextState = nextProps.ticket.getIn(CONTENT_STATE_PATH)

        // here we make sure that we only hide the macros if the current contentState is null
        if (prevContentState === null && nextContextState && nextContextState.hasText()) {
            // macros are visible if only the signature is present
            const visible = onlySignature(nextContextState, nextProps.currentUser)
            this._setMacrosVisible(visible)
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this._hideMacros)
    }

    // Just a handy shortcut
    _setMacrosVisible = (v) => this.props.actions.macro.setMacrosVisible(v)

    _hideMacros = (e) => {
        if (e.keyCode === 27 && !this.props.macros.get('isModalOpen')) {
            this._setMacrosVisible(false)
        }
        return null
    }

    _searchUpdated = (term) => {
        this.props.actions.macro.saveSearch(term)
        this.setState({searchTerm: term}) // Necessary for re-render
    }

    render = () => {
        let {macros} = this.props
        const macrosVisible = macros.get('visible')

        if (this.refs.search && this.refs.search.state.searchTerm && macros.get('items').size) {
            const filters = ['name']
            const items = macros.get('items').valueSeq().toJS()
            macros = macros.set('items', fromJS(items.filter(this.refs.search.filter(filters))))
        }

        return (
            <div className="TicketReplyArea ui segments">
                <div className="search ui raised segment">
                    <SearchInput
                        ref="search"
                        tabIndex="3"
                        onFocus={() => this._setMacrosVisible(true)}
                        onChange={this._searchUpdated}
                        className="ui transparent input full-width shortcuts-enable"
                        placeholder="Search for a macro"
                        autoFocus={macrosVisible}
                    />

                    <a className={classNames({hidden: !macrosVisible, 'clear-macros': true})} ref="popupClearMacros">
                        <i
                            className="right close icon"
                            onClick={() => this._setMacrosVisible(false)}
                        />
                    </a>
                    <div className="ui popup clear-macros-popup">
                        <strong>Esc</strong> to close the macro list.
                    </div>
                </div>

                {macrosVisible && (
                    <TicketMacros
                        macros={macros}
                        applyMacro={this.props.applyMacro}
                        previewMacro={this.props.previewMacro}
                        previewMacroInModal={this.props.previewMacroInModal}
                        openModal={this.props.openModal}
                    />
                )}
                {!macrosVisible && (
                    <TicketReply
                        actions={this.props.actions}
                        ticket={this.props.ticket}
                        appliedMacro={this.props.macros.get('appliedMacro')}
                        users={this.props.users}
                    />
                )}

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
    openModal: PropTypes.func.isRequired
}
