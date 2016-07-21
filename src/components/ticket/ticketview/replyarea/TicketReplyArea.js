import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classNames from 'classnames'
import TicketReply from './TicketReply'
import TicketMacros from './TicketMacros'
import SearchInput from 'react-search-input'

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

        window.addEventListener('keydown', this.hideMacros)
        $('.mousetrap input').addClass('mousetrap')
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.hideMacros)
    }

    hideMacros = (e) => {
        if (e.keyCode === 27 && !this.props.macros.get('isModalOpen')) {
            this.props.actions.macro.setMacrosVisible(false)
        }
        return null
    }

    searchUpdated = (term) => {
        this.props.actions.macro.saveSearch(term)
        this.setState({searchTerm: term}) // Necessary for re-render
    }

    render = () => {
        const setMacrosVisible = this.props.actions.macro.setMacrosVisible
        const macrosVisible = this.props.macros.get('visible')

        let macros = this.props.macros
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
                        autoFocus={!!this.props.ticket.get('id')}
                        onFocus={() => setMacrosVisible(true)}
                        onChange={this.searchUpdated}
                        className="ui transparent input full-width mousetrap"
                        placeholder="Search for a macro"
                    />
                    <a className={classNames({ hidden: !macrosVisible, 'clear-macros': true})} ref="popupClearMacros">
                        <i
                            className="right close icon"
                            onClick={() => setMacrosVisible(false)}
                        />
                    </a>

                    <div className="ui popup clear-macros-popup">
                        <strong>Esc</strong> to close the macro list.
                    </div>
                </div>

                <TicketMacros
                    macros={macros}
                    applyMacro={this.props.applyMacro}
                    previewMacro={this.props.previewMacro}
                    previewMacroInModal={this.props.previewMacroInModal}
                    openModal={this.props.openModal}
                />

                <TicketReply
                    visible={!this.props.macros.get('visible')}
                    actions={this.props.actions}
                    ticket={this.props.ticket}
                    currentUser={this.props.currentUser}
                    appliedMacro={this.props.macros.get('appliedMacro')}
                    users={this.props.users}
                    contentState={this.props.ticket.getIn(['state', 'contentState'])}
                    fromMacro={this.props.ticket.getIn(['state', 'fromMacro'])}
                    autoFocus={!!this.props.ticket.get('id')}
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
    previewMacro: PropTypes.func.isRequired,
    updateMacro: PropTypes.func,
    previewMacroInModal: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired
}
