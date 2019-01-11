// @flow
import React from 'react'

import ConfirmButton from '../../common/components/ConfirmButton'

import type {Node} from 'react'

type Props = {
    action: () => Promise<*>,
    children?: Node,
}

const DeleteAgent = ({
    action,
    children,
    ...buttonProps,
}: Props) => {
    return (
        <ConfirmButton
            content={(
                <span>
                    You are about to <b>delete</b> this team member.
                    This action is <b>irreversible</b>.
                    This will unassign this team member from all its tickets, open or closed, and delete its statistics.
                </span>
            )}
            confirm={action}
            confirmColor="danger"
            {...buttonProps}
        >
            {children}
        </ConfirmButton>
    )
}

export default DeleteAgent
