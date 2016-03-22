import React, {PropTypes} from 'react'
import Immutable from 'immutable'
import classNames from 'classnames'

import TicketReply from './TicketReply'
import TicketMacros from './TicketMacros'

import SearchInput, { createFilter } from 'react-search-input'

export default class TicketReplyArea extends React.Component {
    constructor() {
        super()
        this.state = {searchTerm: ""}
    }

    searchUpdated = (term) => {
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
                    />
            )
        }
        return (
            <TicketReply
                actions={this.props.actions}
                ticket={this.props.ticket}
                currentUser={this.props.currentUser}
                value={this.props.ticket.getIn(['newMessage', 'body_text'])}
                />
        )
    }

    render = () => {
        const setMacrosVisible = this.props.actions.macro.setMacrosVisible
        const macrosVisible = this.props.macros.get('visible')
        let macros = this.props.macros.get('items')

        if (macros.size === 0) {
            return null
        }
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
                        onFocus={() => setMacrosVisible(true)}
                        onChange={this.searchUpdated}
                        className="ui large transparent input full-width"
                        placeholder="Search..."
                        />
                    <a className={classNames({hidden: !macrosVisible})}>
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
    applyMacro: PropTypes.func.isRequired,
    previewMacro: PropTypes.func.isRequired,
}
