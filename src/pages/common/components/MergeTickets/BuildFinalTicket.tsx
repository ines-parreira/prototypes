import React from 'react'
import {fromJS, Map} from 'immutable'

import BinaryChoiceField from '../BinaryChoiceField.js'
import Avatar from '../Avatar/Avatar'

type Props = {
    sourceTicket: Map<any, any>
    targetTicket: Map<any, any>
    finalTicket: Map<any, any>
    updateFinalTicket: (map: Map<any, any>) => void
}

export default class BuildFinalTicket extends React.Component<Props> {
    render() {
        const {
            sourceTicket,
            targetTicket,
            finalTicket,
            updateFinalTicket,
        } = this.props

        const subjectsAreDifferent =
            sourceTicket.get('subject') !== targetTicket.get('subject')
        const customersAreDifferent =
            sourceTicket.getIn(['customer', 'id']) !==
            targetTicket.getIn(['customer', 'id'])

        const sourceAssignee: Map<any, any> =
            sourceTicket.get('assignee_user') || fromJS({})
        const targetAssignee: Map<any, any> =
            targetTicket.get('assignee_user') || fromJS({})

        const assigneesAreDifferent =
            sourceAssignee.get('id') !== targetAssignee.get('id')
        const oneAssigneeIsEmpty =
            sourceAssignee.isEmpty() || targetAssignee.isEmpty()

        const nothingIsDifferent =
            !subjectsAreDifferent &&
            !customersAreDifferent &&
            (!assigneesAreDifferent || oneAssigneeIsEmpty)

        return (
            <div>
                <p>
                    Select the fields you want to keep on the final ticket. The
                    fields in blue will be kept. All fields not displayed here
                    are either identical on both tickets, or will be computed
                    automatically.
                </p>
                {nothingIsDifferent ? (
                    <p className="mt-2 mb=2" style={{textAlign: 'center'}}>
                        These tickets are similar so all fields will be set
                        automatically. Confirm the merge below and you’re all
                        set!
                    </p>
                ) : null}
                {subjectsAreDifferent ? (
                    <BinaryChoiceField
                        label="Subject"
                        options={[
                            {
                                label: sourceTicket.get('subject'),
                                value: sourceTicket.get('subject') || '',
                            },
                            {
                                label: targetTicket.get('subject'),
                                value: targetTicket.get('subject') || '',
                            },
                        ]}
                        value={finalTicket.get('subject') as string}
                        onChange={(subject: string) =>
                            updateFinalTicket(
                                finalTicket.set('subject', subject)
                            )
                        }
                    />
                ) : null}
                {customersAreDifferent ? (
                    <BinaryChoiceField
                        label="Customer"
                        options={[
                            {
                                label: (
                                    <span>
                                        <i className="material-icons mr-2">
                                            person
                                        </i>
                                        {sourceTicket.getIn([
                                            'customer',
                                            'name',
                                        ])}
                                    </span>
                                ),
                                value: sourceTicket.getIn(['customer', 'id']),
                            },
                            {
                                label: (
                                    <span>
                                        <i className="material-icons mr-2">
                                            person
                                        </i>
                                        {targetTicket.getIn([
                                            'customer',
                                            'name',
                                        ])}
                                    </span>
                                ),
                                value: targetTicket.getIn(['customer', 'id']),
                            },
                        ]}
                        value={finalTicket.getIn(['customer', 'id'])}
                        onChange={(customerId: number) =>
                            updateFinalTicket(
                                finalTicket.set(
                                    'customer',
                                    fromJS({id: customerId})
                                )
                            )
                        }
                    />
                ) : null}
                {assigneesAreDifferent && !oneAssigneeIsEmpty ? (
                    <BinaryChoiceField
                        label="Assignee"
                        options={[
                            {
                                label: (
                                    <span>
                                        <Avatar
                                            name={
                                                sourceAssignee.get(
                                                    'name'
                                                ) as string
                                            }
                                            url={sourceAssignee.getIn([
                                                'meta',
                                                'profile_picture_url',
                                            ])}
                                            size={26}
                                            className="d-inline-block mr-2"
                                        />
                                        {sourceAssignee.get('name')}
                                    </span>
                                ),
                                value: sourceAssignee.get('id'),
                            },
                            {
                                label: (
                                    <span>
                                        <Avatar
                                            name={
                                                targetAssignee.get(
                                                    'name'
                                                ) as string
                                            }
                                            url={targetAssignee.getIn([
                                                'meta',
                                                'profile_picture_url',
                                            ])}
                                            size={26}
                                            className="d-inline-block mr-2"
                                        />
                                        {targetAssignee.get('name')}
                                    </span>
                                ),
                                value: targetAssignee.get('id'),
                            },
                        ]}
                        value={finalTicket.getIn(['assignee_user', 'id'])}
                        onChange={(assigneeUserId: number) =>
                            updateFinalTicket(
                                finalTicket.set(
                                    'assignee_user',
                                    fromJS({id: assigneeUserId})
                                )
                            )
                        }
                    />
                ) : null}
            </div>
        )
    }
}
