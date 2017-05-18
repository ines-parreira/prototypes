import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {UncontrolledTooltip} from 'reactstrap'

import {isRichType} from '../../../../../config/ticket'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
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
        const {macros, newMessageType, openModal, setMacrosVisible} = this.props
        const items = macros.get('items')
        const macro = macros.get('selected')
        const macrosVisible = macros.get('visible')

        let content = (
            <div className="ui grid">
                <div className="macro-list four wide column">
                    <div className="ui aligned selection relaxed list">
                        {items.map(this.renderMacroListItem).toList()}
                    </div>
                </div>
                <div className="macro-preview-container twelve wide column">
                    <a
                        className="ui basic label manage-macros"
                        onClick={() => this.openModalOnSelectedMacro(macro.get('id'))}
                    >
                        Manage macros
                    </a>
                    <Preview
                        displayHTML={isRichType(newMessageType)}
                        macro={macro}
                    />
                </div>
            </div>
        )

        if (!items.size) {
            content = (
                <div className="no-result-container">
                    <h4>You don't have any macros yet.</h4>
                    <div
                        className="ui small light labeled icon blue button"
                        onClick={() => openModal()}
                    >
                        <i className="plus icon" />
                        Create a new macro
                    </div>
                </div>
            )
        }
        return (
            <div className="TicketMacros">
                <a
                    id="clear-macro-button"
                    className={classnames('clear-macros', {
                        hidden: !macrosVisible
                    })}
                    onClick={() => setMacrosVisible(false)}
                >
                    <i className="fa fa-fw fa-close" />
                </a>
                <UncontrolledTooltip
                    placement="top"
                    target="clear-macro-button"
                    delay={0}
                >
                    <strong>Esc</strong> to close the macro list.
                </UncontrolledTooltip>

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
    setMacrosVisible: PropTypes.func.isRequired
}

TicketMacros.defaultProps = {
    macros: fromJS({})
}

function mapStateToProps(state) {
    return {
        newMessageType: newMessageSelectors.getNewMessageType(state),
    }
}

export default connect(mapStateToProps)(TicketMacros)
