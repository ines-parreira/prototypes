import {Label, Tooltip} from '@gorgias/merchant-ui-kit'
import React from 'react'

import {UserRole} from 'config/types/user'
import {ORDERED_ROLES_META_BY_USER_ROLE} from 'config/user'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'

import css from './Detail.less'
import {AgentState} from './types'

type Props = {
    role: UserRole
    setAgentState: (arg1: (state: AgentState) => AgentState) => void
    isSelf: boolean
    isViewingAccountOwner: boolean
}

export const Role = ({
    role,
    setAgentState,
    isSelf,
    isViewingAccountOwner,
}: Props) => {
    const isDisabled = isSelf || isViewingAccountOwner
    return (
        <>
            <Label className={css.label}>Role</Label>
            <p>
                For a comprehensive permissions table,{' '}
                <a
                    href="https://docs.gorgias.com/en-US/user-permissions-196938"
                    target="_blank"
                    rel="noreferrer"
                >
                    see this article
                </a>
                .
            </p>
            {ORDERED_ROLES_META_BY_USER_ROLE.map(([key, orderedRole]) => {
                const id = `detail-role-${key}`
                return (
                    <React.Fragment key={key}>
                        <PreviewRadioButton
                            id={id}
                            name="role"
                            value={key}
                            className={css.radioTile}
                            isSelected={role === key}
                            {...orderedRole}
                            isDisabled={isDisabled}
                            onClick={() =>
                                setAgentState((previousState) => ({
                                    ...previousState,
                                    role: key,
                                }))
                            }
                        />
                        {isDisabled && (
                            <Tooltip target={id}>
                                {isViewingAccountOwner
                                    ? 'You cannot edit account owner'
                                    : 'You cannot update your own role'}
                            </Tooltip>
                        )}
                    </React.Fragment>
                )
            })}
        </>
    )
}
