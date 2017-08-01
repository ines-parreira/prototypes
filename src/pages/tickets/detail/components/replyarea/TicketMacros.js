import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {UncontrolledTooltip, Button} from 'reactstrap'

import {isRichType} from '../../../../../config/ticket'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import Preview from '../../../common/macros/Preview'

class TicketMacros extends React.Component {
    componentDidUpdate(prevProps) {
        // brings the preview to top when previewing another macro
        if (this.props.selectedMacroId !== prevProps.selectedMacroId) {
            const element = ReactDOM.findDOMNode(this.refs.previewContainer)

            if (element) {
                element.scrollTop = 0
            }
        }
    }

    openModalOnSelectedMacro() {
        this.props.openModal()
    }

    renderMacroListItem = (macro) => {
        return (
            <div
                key={macro.get('id')}
                className={classnames('macro-item', {
                    active: macro.get('id') === this.props.selectedMacroId,
                })}
                onMouseEnter={() => this.props.setSelectedMacroId(macro.get('id'))}
                onClick={() => this.props.applyMacro(macro)}
            >
                <div className="content">
                    {macro.get('name')}
                </div>
            </div>
        )
    }

    render() {
        const {macros, newMessageType, openModal, searchedTerm, setMacrosVisible} = this.props
        const items = macros.get('items')
        const macro = items.get(this.props.selectedMacroId) || fromJS({})
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
                    {
                        this.props.isLoading ? (
                                <div className="macro-item disabled">
                                    <i>Searching...</i>
                                </div>
                            ) : (
                                items.map(this.renderMacroListItem).toList()
                            )
                    }
                </div>
                <div
                    className="macro-preview-container"
                    ref="previewContainer"
                >
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

        if (items.isEmpty()) {
            content = (
                <div className="no-result-container">
                    <p>
                        {
                            !!searchedTerm ? (
                                    <span>No macro for <b>{searchedTerm}</b></span>
                                ) : 'You don\'t have any macros yet'
                        }
                    </p>
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
    openModal: PropTypes.func.isRequired,
    newMessageType: PropTypes.string.isRequired,
    setMacrosVisible: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    searchedTerm: PropTypes.string,
    selectedMacroId: PropTypes.number,
    setSelectedMacroId: PropTypes.func.isRequired,
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
