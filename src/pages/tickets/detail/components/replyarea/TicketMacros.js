import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'

import {isRichType} from '../../../../../config/ticket'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import Preview from '../../../common/macros/Preview'
import Tooltip from '../../../../common/components/Tooltip'

import {notify} from './../../../../../state/notifications/actions'

@connect((state) => ({
    newMessageType: newMessageSelectors.getNewMessageType(state),
}), {
    notify
})
export default class TicketMacros extends React.Component {
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
        if (!macro) {
            return null
        }

        return (
            <div
                key={macro.get('id')}
                className={classnames('macro-item', {
                    active: macro.get('id') === this.props.selectedMacroId
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
        const {macros, macrosVisible, newMessageType, openModal, searchQuery, setMacrosVisible} = this.props
        const macro = macros.find((macro) => macro.get('id') === this.props.selectedMacroId) || fromJS({})

        let content = (
            <div
                className="d-flex"
                style={{height: '100%'}}
            >
                <div
                    className="macro-list"
                    style={{width: '35%'}}
                >
                    {macros.map(this.renderMacroListItem)}
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

        if (macros.isEmpty()) {
            content = (
                <div className="no-result-container">
                    <p>
                        {
                            !!searchQuery ? (
                                <span>No macro for <b>{searchQuery}</b></span>
                            ) : 'You don\'t have any macros yet'
                        }
                    </p>
                    <Button
                        type="button"
                        color="info"
                        onClick={openModal}
                    >
                        <i className="fa fa-fw fa-plus mr-2"/>
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
                            <i className="fa fa-fw fa-close hidden-sm-down"/>
                            <Button
                                color="secondary"
                                size="sm"
                                className="hidden-md-up"
                            >
                                Close
                            </Button>
                            <Tooltip
                                placement="top"
                                target="clear-macro-button"
                            >
                                <strong>Esc</strong> to close the macro list.
                            </Tooltip>
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
    macrosVisible: PropTypes.bool.isRequired,
    applyMacro: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    newMessageType: PropTypes.string,
    setMacrosVisible: PropTypes.func.isRequired,
    searchQuery: PropTypes.string,
    selectedMacroId: PropTypes.number,
    setSelectedMacroId: PropTypes.func.isRequired,
    notify: PropTypes.func
}

TicketMacros.defaultProps = {
    macros: fromJS([]),
    macrosVisible: false,
}
