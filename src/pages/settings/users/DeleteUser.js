// @flow
import React from 'react'

import type {Node} from 'react'

import ConfirmButton from '../../common/components/ConfirmButton.tsx'

type Props = {
    action: () => Promise<*>,
    children?: Node,
}

const DeleteUser = (props: Props) => {
    const {action, children, ...buttonProps} = props
    return (
        <ConfirmButton
            content={
                <span>
                    You are about to <b>delete</b> this user. This action is{' '}
                    <b>irreversible</b>. This will unassign this user from all
                    their tickets, open or closed, and delete their statistics.
                </span>
            }
            confirm={action}
            confirmColor="danger"
            {...buttonProps}
        >
            {children}
        </ConfirmButton>
    )
}

export default DeleteUser
