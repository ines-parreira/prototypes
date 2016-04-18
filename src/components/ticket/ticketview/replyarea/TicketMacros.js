import React, { PropTypes } from 'react'
import classNames from 'classnames'


export default class TicketMacros extends React.Component {
    renderMacroListItem = (macro) => {
        const containerOpts = {
            key: macro.get('id'),
            className: classNames('item macro-item', { active: macro.get('id') === this.props.selected.get('id') }),
            onMouseEnter: () => this.props.previewMacro(macro),
            onClick: () => this.props.applyMacro(macro),
        }

        return (
            <div {...containerOpts}>
                <div className="content">
                    <div className="">{macro.get('name')}</div>
                </div>
            </div>
        )
    }

    renderAddTags(addTagsActions) {
        if (!addTagsActions || !addTagsActions.size) {
            return null
        }

        return (
            <div className="macro-data">
                <div className="ui label macro-legend">TAGS: </div>
                {
                    addTagsActions.map((action) =>
                        <div key={`action-tag-${action.id}`} className="ui label ticket-tag no-icon">{action.getIn(['arguments', '0', 'name'])}</div>
                    )
                }
            </div>
        )
    }

    renderExternalActions(externalActions) {
        if (!externalActions || !externalActions.size) {
            return null
        }

        return (
            <div className="macro-data">
                <div className="ui label macro-legend">ACTIONS: </div>
                {
                    externalActions.map((action) =>
                        <div key={`external-action-${action.id}`} className="ui yellow label">{action.get('title')}</div>
                    )
                }
            </div>
        )
    }

    renderSelectedMacro = () => {
        const macro = this.props.selected

        if (macro.isEmpty()) {
            return null
        }

        const addTagsActions = macro.get('actions').filter(action => action.get('name') === 'addTags')
        const responseTextAction = macro.get('actions').filter(action => action.get('name') === 'setResponseText').get('0')
        const externalActions = macro.get('actions').filter(
            action => action.get('name') !== 'addTags' && action.get('name') !== 'setResponseText'
        )

        return (
            <div className="macro-preview">
                <div>
                    {this.renderAddTags(addTagsActions)}
                    {this.renderExternalActions(externalActions)}
                    <div className="text-preview" dangerouslySetInnerHTML={{
                        __html: responseTextAction.getIn(['arguments', 'body_html'])
                        || responseTextAction.getIn(['arguments', 'body_text']) }}
                    >
                    </div>
                </div>
            </div>
        )
    }

    render = () => {
        return (
            <div className="TicketMacros search ui raised segment">
                <div className="ui grid">
                    <div className="macro-list four wide column">
                        <div className="ui aligned selection relaxed list">
                            {this.props.items.map(this.renderMacroListItem)}
                        </div>
                    </div>
                    <div className="macro-preview-container twelve wide column">
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
    selected: PropTypes.object.isRequired,
    applyMacro: PropTypes.func.isRequired,
    previewMacro: PropTypes.func.isRequired,
}
