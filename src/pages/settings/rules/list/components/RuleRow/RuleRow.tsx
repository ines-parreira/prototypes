import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import classnames from 'classnames'
import {Badge, Button, Popover, PopoverHeader, PopoverBody} from 'reactstrap'
import {Map} from 'immutable'

import * as RuleActions from '../../../../../../state/rules/actions'
import {notify} from '../../../../../../state/notifications/actions'
import {RootState} from '../../../../../../state/types'
import {GorgiasThunkDispatch} from '../../../../../../../../../../types/redux-thunk'

import ToggleButton from '../../../../../common/components/ToggleButton.js'
import RuleItem from '../../../detail/components/RuleItem/RuleItem.js'

import css from './RuleRow.less'

type OwnProps = {
    rule: Map<any, any>
    toggleOpening: (id: number) => void
    isOpen: boolean
    canDuplicate: boolean
}

type State = {
    showConfirmation: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

class RuleRow extends React.Component<Props, State> {
    state = {
        showConfirmation: false,
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
        const toggleId = `rule-toggle-${rule.get('id') as string}`

        return (
            <tr
                id={rule.get('id')}
                key={rule.get('id')}
                data-id={rule.get('id')} // dragging info
                className={classnames('draggable', css.row)}
            >
                <td className="smallest align-middle">
                    <i
                        className={classnames(
                            'material-icons text-faded drag-handle',
                            css.dragHandle
                        )}
                    >
                        drag_handle
                    </i>
                </td>

                <td
                    className={classnames('link-full-td', css['middle-column'])}
                >
                    <a onClick={() => this.props.toggleOpening(rule.get('id'))}>
                        <div>
                            <span className="mr-2">
                                <b>{rule.get('name')}</b>
                                {rule.get('type') === 'system' && (
                                    <Badge className="ml-2" color="danger">
                                        <i className="material-icons mr-2">
                                            warning
                                        </i>
                                        SYSTEM
                                    </Badge>
                                )}
                            </span>
                            <span className="text-faded">
                                {rule.get('description')}
                            </span>
                        </div>
                    </a>
                </td>

                <td className="smallest align-middle position-relative">
                    <ToggleButton
                        value={!rule.get('deactivated_datetime')}
                        onChange={this._toggleItemStatus as () => Promise<any>}
                    />
                    <div className={css.confirmationPopover} id={toggleId} />
                    <Popover
                        placement="left"
                        isOpen={showConfirmation}
                        target={toggleId}
                        toggle={this._toggleConfirmation}
                        trigger="legacy"
                    >
                        <PopoverHeader>Are you sure?</PopoverHeader>
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
        const {rule, actions, toggleOpening, canDuplicate, notify} = this.props

        return (
            <RuleItem
                rule={rule}
                actions={actions}
                toggleOpening={toggleOpening}
                canDuplicate={canDuplicate}
                notify={notify}
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

const connector = connect(
    (state: RootState) => ({
        currentUser: state.currentUser,
    }),
    (dispatch: GorgiasThunkDispatch<any, any, any>) => {
        return {
            actions: {
                rules: bindActionCreators(RuleActions, dispatch),
            },
            notify: bindActionCreators(notify, dispatch),
        }
    }
)

export default connector(RuleRow)
