import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {isRichType} from '../../../../../config/ticket'
import * as ticketSelectors from '../../../../../state/ticket/selectors'
import Preview from '../../../common/macros/Preview'

class TicketMacros extends React.Component {
    openModalOnSelectedMacro(selectedMacroId) {
        this.props.previewMacroInModal(selectedMacroId)
        this.props.openModal()
    }

    renderMacroListItem = (macro) => {
        const containerOpts = {
            key: macro.get('id'),
            className: classnames('item macro-item', {
                active: macro.get('id') === this.props.macros.getIn(['selected', 'id'])
            }),
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

    render() {
        const items = this.props.macros.get('items')
        const macro = this.props.macros.get('selected')

        let content = (
            <div className="ui grid">
                <div className="macro-list four wide column">
                    <div className="ui aligned selection relaxed list">
                        {items.map(this.renderMacroListItem).toList()}
                    </div>
                </div>
                <div className="macro-preview-container twelve wide column">
                    <div className="macro-detail">
                        <a
                            className="ui right floated basic label"
                            onClick={() => this.openModalOnSelectedMacro(macro.get('id'))}
                        >
                            MANAGE MACROS
                        </a>
                        <Preview
                            displayHTML={isRichType(this.props.newMessageType)}
                            macro={macro}
                        />
                    </div>
                </div>
            </div>
        )

        if (!items.size) {
            content = (
                <div className="no-result-container">
                    <h4>You don't have any macros yet.</h4>
                    <div
                        className="ui small light labeled icon blue button"
                        onClick={() => this.props.openModal()}
                    >
                        <i className="plus icon" />
                        Create a new macro
                    </div>
                </div>
            )
        }
        return (
            <div className="TicketMacros">
                {content}
            </div>
        )
    }
}

TicketMacros.propTypes = {
    macros: PropTypes.object.isRequired,
    applyMacro: PropTypes.func.isRequired,
    previewMacro: PropTypes.func.isRequired,
    previewMacroInModal: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    newMessageType: PropTypes.string.isRequired,
}

TicketMacros.defaultProps = {
    macros: fromJS({})
}

function mapStateToProps(state) {
    return {
        newMessageType: ticketSelectors.getNewMessageType(state),
    }
}

export default connect(mapStateToProps)(TicketMacros)
