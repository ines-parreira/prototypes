import React, {PropTypes} from 'react'
import Immutable from 'immutable'
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
        window.addEventListener('keydown', this.hideMacros.bind(this))
        $('.mousetrap input').addClass('mousetrap')
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.hideMacros.bind(this))
    }

    hideMacros(e) {
        if (e.keyCode === 27) this.props.actions.macro.setMacrosVisible(false)
        return null
    }

    searchUpdated = (term) => {
        this.props.actions.macro.saveSearch(term)
        this.setState({searchTerm: term}) // Necessary for re-render
    }

    renderChild = (macros) => {
        if (this.props.macros.get('visible')) {
            return (
                <TicketMacros
                    items={macros}
                    selected={this.props.macros.get('selected')}
                    applyMacro={this.props.applyMacro}
                    previewMacro={this.props.previewMacro}
                    previewMacroInModal={this.props.previewMacroInModal}
                    openModal={this.props.openModal}
                />
            )
        }

        return (
            <TicketReply
                actions={this.props.actions}
                ticket={this.props.ticket}
                currentUser={this.props.currentUser}
                appliedMacro={this.props.macros.get('appliedMacro')}
                users={this.props.users}
                value={this.props.ticket.getIn(['newMessage', 'body_html'])}
                autoFocus={!!this.props.ticket.get('id')}
            />
        )
    }

    render = () => {
        const setMacrosVisible = this.props.actions.macro.setMacrosVisible
        const macrosVisible = this.props.macros.get('visible')
        let macros = this.props.macros.get('items')

        macros = macros.valueSeq()

        if (this.refs.search) {
            const filters = ['name']
            macros = Immutable.fromJS(macros.toJS().filter(this.refs.search.filter(filters)))
        }

        return (
            <div className="TicketReplyArea ui segments">
                <div className="search ui raised segment">
                    <SearchInput
                        ref="search"
                        tabIndex="2"
                        autoFocus={!!this.props.ticket.get('id')}
                        onFocus={() => setMacrosVisible(true)}
                        onChange={this.searchUpdated}
                        className="ui transparent input full-width mousetrap"
                        placeholder="Search for a macro"
                    />
                    <a className={classNames({ hidden: !macrosVisible })}>
                        <i
                            className="clear-macros right close icon"
                            onClick={() => setMacrosVisible(false)}
                        />
                    </a>
                </div>
                {this.renderChild(macros)}
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
