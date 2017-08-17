import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _omit from 'lodash/omit'
import {UncontrolledTooltip, Button} from 'reactstrap'

import Modal from '../../Modal'

import {getActionByName} from '../../../../../config/actions'
import * as segmentTracker from '../../../../../store/middlewares/segmentTracker'

import * as infobarActions from '../../../../../state/infobar/actions'
import * as infobarSelectors from '../../../../../state/infobar/selectors'
import * as infobarUtils from '../../../../../state/infobar/utils'

import css from './ActionButton.less'

@connect((state) => {
    return {
        getPendingActionCallback: infobarSelectors.makeGetPendingActionCallbacks(state),
    }
}, {
    executeAction: infobarActions.executeAction,
})
class ActionButton extends React.Component {
    static propTypes = {
        actionName: PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
        children: PropTypes.node,
        executeAction: PropTypes.func.isRequired,
        getPendingActionCallback: PropTypes.func.isRequired,
        payload: PropTypes.object,
        reason: PropTypes.string.isRequired,
        tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
        tooltip: PropTypes.string,
    }

    static defaultProps = {
        tag: 'div',
    }

    static contextTypes = {
        integration: ImmutablePropTypes.map.isRequired,
        integrationId: PropTypes.number.isRequired,
        userId: PropTypes.number.isRequired,
    }

    state = {
        showSuccess: false,
        showError: false,
        isLoading: false,
        showConfirmation: false
    }

    constructor(props, context) {
        super(props, context)
        this._generateId(props, context)
    }

    componentWillReceiveProps(nextProps) {
        this._generateId(nextProps, this.context)
        this.setState({isLoading: !!nextProps.getPendingActionCallback(this.id)})
    }

    _generateId = (props, context) => {
        const data = {
            action_name: props.actionName,
            user_id: context.userId,
            integration_id: context.integrationId,
            payload: props.payload,
        }

        this.id = infobarUtils.actionButtonHashForData(data)
    }

    _confirmAction = () => {
        const actionConfig = getActionByName(this.props.actionName)

        if (actionConfig) {
            segmentTracker.logEvent(segmentTracker.EVENTS.INFOBAR_ACTION_CLICKED, {
                type: this.context.integration.get('type'),
                name: actionConfig.label,
            })
        }

        this.props.executeAction(
            this.props.actionName,
            this.context.integrationId,
            this.context.userId,
            this.props.payload,
            (response) => {
                if (response.status === 'error') {
                    this.setState({showError: true})
                    setTimeout(() => this.setState({showError: false}), 4000)
                    return
                }

                this.setState({showSuccess: true})
                setTimeout(() => this.setState({showSuccess: false}), 4000)
            })

        this._toggleConfirmation()
    }

    _toggleConfirmation = () => {
        this.setState({showConfirmation: !this.state.showConfirmation})
    }

    render() {
        const {
            children,
            tag: Tag,
            tooltip,
            ...attributes
        } = _omit(this.props, ['className', 'actionName', 'getPendingActionCallback', 'payload', 'reason', 'executeAction'])
        let {
            className,
            reason
        } = this.props

        // remove the "basic" button style when there is an error or a success to show the color better
        if (this.state.showSuccess || this.state.showError) {
            className = className.replace('basic', '')
        }

        return (
            <div className={css.container}>
                <Tag
                    id={this.id}
                    className={classnames(css.button, className, {
                        'disabled loading btn-loading': this.state.isLoading,
                        'btn-success': this.state.showSuccess,
                        'btn-danger': this.state.showError,
                    })}
                    disabled={this.state.isLoading}
                    onClick={this._toggleConfirmation}
                    {...attributes}
                >
                    {children}
                    {
                        tooltip && this.id && (
                            <UncontrolledTooltip
                                placement="top"
                                target={this.id}
                                delay={0}
                            >
                                {tooltip}
                            </UncontrolledTooltip>
                        )
                    }
                </Tag>
                <Modal
                    size="sm"
                    isOpen={this.state.showConfirmation}
                    onClose={this._toggleConfirmation}
                    footer={(
                        <div className="w-100">
                            <Button
                                color="success"
                                onClick={this._confirmAction}
                            >
                                Yes
                            </Button>
                            <Button
                                className="pull-right"
                                onClick={this._toggleConfirmation}
                            >
                                No
                            </Button>
                        </div>
                    )}
                >
                    <div>
                        Are you sure you want to {reason}?
                    </div>
                </Modal>
            </div>
        )
    }
}

export default ActionButton
