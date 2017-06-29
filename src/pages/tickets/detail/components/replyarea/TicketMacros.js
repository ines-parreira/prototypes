import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {UncontrolledTooltip, Button} from 'reactstrap'

import {isRichType} from '../../../../../config/ticket'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import Preview from '../../../common/macros/Preview'

class TicketMacros extends React.Component {
    openModalOnSelectedMacro(selectedMacroId) {
        this.props.previewMacroInModal(selectedMacroId)
        this.props.openModal()
    }

    renderMacroListItem = (macro) => {
        return (
            <div
                key={macro.get('id')}
                className={classnames('macro-item', {
                    active: macro.get('id') === this.props.macros.getIn(['selected', 'id'])
                })}
                onMouseEnter={() => this.props.previewMacro(macro)}
                onClick={() => this.props.applyMacro(macro)}
            >
                <div className="content">
                    {macro.get('name')}
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
            <div
                className="d-flex"
                style={{height: '100%'}}
            >
                <div
                    className="macro-list"
                    style={{width: '25%'}}
                >
                    {items.map(this.renderMacroListItem).toList()}
                </div>
                <div className="macro-preview-container">
                    <a
                        className="btn btn-secondary manage-macros"
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
                    <p>You don't have any macros yet.</p>
                    <Button
                        type="button"
                        color="info"
                        onClick={openModal}
                    >
                        <i className="fa fa-fw fa-plus mr-2" />
                        Create a new macro
                    </Button>
                </div>
            )
        }
        return (
            <div className="TicketMacros">
                {
                    macrosVisible && (
                        <a
                            id="clear-macro-button"
                            className="clear-macros"
                            onClick={() => setMacrosVisible(false)}
                        >
                            <i className="fa fa-fw fa-close hidden-sm-down" />
                            <Button
                                color="secondary"
                                size="sm"
                                className="hidden-md-up"
                            >
                                Close
                            </Button>
                            <UncontrolledTooltip
                                placement="top"
                                target="clear-macro-button"
                                delay={0}
                            >
                                <strong>Esc</strong> to close the macro list.
                            </UncontrolledTooltip>
                        </a>
                    )
                }

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
