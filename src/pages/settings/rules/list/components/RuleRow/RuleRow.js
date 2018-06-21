// @flow
import React from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Badge, Button, Popover, PopoverHeader, PopoverBody} from 'reactstrap'

import ToggleButton from '../../../../../common/components/ToggleButton'

import RuleItem from '../../../detail/components/RuleItem'

import * as css from './RuleRow.less'


type Props = {
    actions: Object,
    currentUser: Object,
    rule: Object,
    toggleOpening: (number) => void,
    isOpen: boolean,
}

type State = {
    showConfirmation: boolean
}

class RuleRow extends React.Component<Props, State> {
    state = {
        showConfirmation: false
    }

    _toggleConfirmation = () => {
        this.setState({showConfirmation: !this.state.showConfirmation})
    }

    _handleActivate = () => {
        const {actions, rule} = this.props
        actions.rules.activate(rule.get('id'))
    }

    _handleDeactivate = () => {
        const {actions, rule} = this.props

        actions.rules.deactivate(rule.get('id'))
        this._toggleConfirmation()
    }

    _toggleItemStatus = () => {
        const checked = !!this.props.rule.get('deactivated_datetime')
        if (checked) {
            this._handleActivate()
        } else {
            this._toggleConfirmation()
        }
    }

    _renderClosed = () => {
        const {rule} = this.props
        const {showConfirmation} = this.state
        const toggleId = `rule-toggle-${rule.get('id')}`

        return (
            <tr
                id={rule.get('id')}
                key={rule.get('id')}
                data-id={rule.get('id')} // dragging info
                className={classnames('draggable', css.row)}
            >
                <td className="smallest align-middle">
                    <i className={classnames('material-icons text-faded drag-handle', css.dragHandle)}>
                        drag_handle
                    </i>
                </td>

                <td className={classnames('link-full-td', css['middle-column'])}>
                    <a onClick={() => this.props.toggleOpening(rule.get('id'))}>
                        <div>
                            <span className="mr-2">
                                <b>{rule.get('title')}</b>
                                {
                                    rule.get('type') === 'system' && (
                                        <Badge
                                            className="ml-2"
                                            color="danger"
                                        >
                                            <i className="fa fa-fw fa-exclamation-triangle mr-2"/>
                                            SYSTEM
                                        </Badge>
                                    )
                                }
                            </span>
                            <span className="text-faded">
                                {rule.get('description')}
                            </span>
                        </div>
                    </a>
                </td>

                <td className="smallest align-middle">
                    <div id={toggleId}>
                        <ToggleButton
                            value={!rule.get('deactivated_datetime')}
                            onChange={this._toggleItemStatus}
                        />
                    </div>
                    <Popover
                        placement="left"
                        isOpen={showConfirmation}
                        target={toggleId}
                        toggle={this._toggleConfirmation}
                    >
                        <PopoverHeader>
                            Are you sure?
                        </PopoverHeader>
                        <PopoverBody>
                            <p>
                                Are you sure you want to deactivate this rule?
                            </p>

                            <Button
                                type="submit"
                                color="success"
                                onClick={this._handleDeactivate}
                            >
                                Confirm
                            </Button>
                        </PopoverBody>
                    </Popover>
                </td>
            </tr>
        )
    }

    _renderOpened = () => {
        const {rule, actions, toggleOpening} = this.props

        return (
            <RuleItem
                rule={rule}
                actions={actions}
                toggleOpening={toggleOpening}
            />
        )
    }

    render() {
        if (this.props.isOpen) {
            return this._renderOpened()
        }

        return this._renderClosed()
    }
}

const mapStateToProps = (state) => ({
    currentUser: state.currentUser,
})

export default connect(mapStateToProps)(RuleRow)
