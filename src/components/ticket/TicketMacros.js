import React, {PropTypes} from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import TicketMacroAction from './TicketMacroAction'

export default class TicketMacros extends React.Component {
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
                    {macro.get('actions').map((action) =>
                        <TicketMacroAction key={action.get('id')} action={action} />
                    )}
                </div>
            </div>
        )
    }

    render = () => {
        let { items } = this.props

        return (
            <div className="TicketMacros search ui raised segment">
                <div className="ui grid">
                    <div className="four wide column">
                        <div className="ui large aligned selection list">
                            {this.props.items.map(this.renderMacroListItem)}
                        </div>
                    </div>
                    <div className="twelve wide column">
                        <div className="macro-detail">
                            {this.renderSelectedMacro()}
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

