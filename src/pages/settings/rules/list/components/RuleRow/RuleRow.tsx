import React, {useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Badge, Button, Popover, PopoverHeader, PopoverBody} from 'reactstrap'

import {notify} from '../../../../../../state/notifications/actions'
import {RootState} from '../../../../../../state/types'

import ToggleButton from '../../../../../common/components/ToggleButton'
import RuleItem from '../../../detail/components/RuleItem/RuleItem'
import type {Rule} from '../../../../../../state/rules/types'
import {
    activateRule,
    deactivateRule,
} from '../../../../../../models/rule/resources'
import {ruleUpdated} from '../../../../../../state/entities/rules/actions'
import {NotificationStatus} from '../../../../../../state/notifications/types'

import css from './RuleRow.less'

type OwnProps = {
    rule: Rule
    toggleOpening: (id: number | number[]) => void
    isOpen: boolean
    canDuplicate: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function RuleRow({
    rule,
    toggleOpening,
    isOpen,
    canDuplicate,
    notify,
    ruleUpdated,
}: Props) {
    const [confirmationIsShown, setConfirmationIsShown] = useState(false)

    const toggleConfirmation = () => {
        setConfirmationIsShown(!confirmationIsShown)
    }

    const handleActivate = async () => {
        try {
            const res = await activateRule(rule.id)
            ruleUpdated(res)
            void notify({
                status: NotificationStatus.Success,
                message: 'Rule activated successfully',
            })
        } catch (error) {
            void notify({
                status: NotificationStatus.Error,
                message: 'Unable to deactivate rule',
            })
        }
    }

    const handleDeactivate = async () => {
        try {
            const res = await deactivateRule(rule.id)
            ruleUpdated(res)
            void notify({
                status: NotificationStatus.Success,
                message: 'Rule deactivated successfully',
            })
        } catch (error) {
            void notify({
                status: NotificationStatus.Error,
                message: 'Unable to deactivate rule',
            })
        }
        setConfirmationIsShown(false)
    }

    const toggleItemStatus = async () => {
        const checked = !!rule.deactivated_datetime
        if (checked) {
            await handleActivate()
        } else {
            toggleConfirmation()
        }
    }

    const renderClosed = () => {
        const toggleId = `rule-toggle-${rule.id}`

        return (
            <tr
                id={rule.id.toString()}
                key={rule.id}
                data-id={rule.id} // dragging info
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
                    <a onClick={() => toggleOpening(rule.id)}>
                        <div>
                            <span className="mr-2">
                                <b>{rule.name}</b>
                                {rule.type === 'system' && (
                                    <Badge className="ml-2" color="danger">
                                        <i className="material-icons mr-2">
                                            warning
                                        </i>
                                        SYSTEM
                                    </Badge>
                                )}
                            </span>
                            <span className="text-faded">
                                {rule.description}
                            </span>
                        </div>
                    </a>
                </td>

                <td className="smallest align-middle position-relative">
                    <ToggleButton
                        value={!rule.deactivated_datetime}
                        onChange={toggleItemStatus}
                    />
                    <div className={css.confirmationPopover} id={toggleId} />
                    <Popover
                        placement="left"
                        isOpen={confirmationIsShown}
                        target={toggleId}
                        toggle={toggleConfirmation}
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
                                onClick={handleDeactivate}
                            >
                                Confirm
                            </Button>
                        </PopoverBody>
                    </Popover>
                </td>
            </tr>
        )
    }

    const renderOpened = () => {
        return (
            <RuleItem
                rule={rule}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                toggleOpening={toggleOpening}
                canDuplicate={canDuplicate}
            />
        )
    }
    return isOpen ? renderOpened() : renderClosed()
}

const connector = connect(
    (state: RootState) => ({
        currentUser: state.currentUser,
    }),
    {
        notify,
        ruleUpdated,
    }
)

export default connector(RuleRow)
