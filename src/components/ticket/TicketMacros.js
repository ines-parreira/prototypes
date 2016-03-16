import React, {PropTypes} from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import TicketMacroAction from './TicketMacroAction'
import SearchInput from 'react-search-input'
import {createFilter} from 'react-search-input'

export default class TicketMacros extends React.Component {
    constructor() {
        super()
        this.state = {searchTerm: ""}
    }

    searchUpdated = (term) => {
        this.setState({searchTerm: term}) // Necessary for re-render
    }

    renderMacroListItem = (macro) => {
        const containerOpts = {
            key: macro.get('id'),
            className: classNames('item', {active: macro === this.props.selected}),
            onMouseEnter: () => this.props.previewMacro(macro),
            onClick: () => this.props.applyMacro(macro),
        }

        return (
            <div  {...containerOpts}>
                <div className="content">
                    <div className="header">{macro.get('name')}</div>
                </div>
            </div>
        )
    }

    renderSelectedMacro = () => {
        const macro = this.props.selected
        if (!macro) {
            return null
        }

        return (
            <div>
                <h2>{macro.get('name')}</h2>
                <div>
                    {macro.get('actions').map((action) => {
                        return <TicketMacroAction key={action.get('id')} action={action} />
                    })}
                </div>
            </div>
        )
    }

    render = () => {
        let { items } = this.props
        if (items.size === 0) {
            return null
        }
        items = items.valueSeq()

        if (this.refs.search) {
            const filters = ['name']
            items = items.filter(this.refs.search.filter(filters))
        }

        return (
            <div className="TicketMacros">
                <div className="ui segments">
                    <div className="search ui raised segment">
                        <SearchInput
                            ref="search"
                            onChange={this.searchUpdated}
                            className="ui large transparent input"
                            placeholder="Search..."
                            />
                    </div>
                    <div className="search ui raised segment">
                        <div className="ui grid">
                            <div className="four wide column">
                                <div className="ui large aligned selection list">
                                    {items.map(this.renderMacroListItem)}
                                </div>
                            </div>
                            <div className="twelve wide column">
                                <div className="macro-detail">
                                    {this.renderSelectedMacro()}
                                </div>
                            </div>
                        </div>
                    </div>                
                </div>
            </div>
        )
    }
}

TicketMacros.propTypes = {
    items: PropTypes.object.isRequired,
    applyMacro: PropTypes.func.isRequired,
    previewMacro: PropTypes.func.isRequired,
}

