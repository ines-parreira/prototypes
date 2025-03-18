import React from 'react'

import { Label, Tooltip } from '@gorgias/merchant-ui-kit'

import { UserRole } from 'config/types/user'
import { ORDERED_ROLES_META_BY_USER_ROLE } from 'config/user'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import { RoleLabel } from 'pages/common/utils/labels'

import { AgentState } from './types'

import css from './Detail.less'

type Props = {
    role: UserRole
    setAgentState: (arg1: (state: AgentState) => AgentState) => void
    isSelf: boolean
    isBotAgent: boolean
    isViewingAccountOwner: boolean
}

export const Role = ({
    role,
    setAgentState,
    isSelf,
    isBotAgent,
    isViewingAccountOwner,
}: Props) => {
    const isDisabled = isSelf || isViewingAccountOwner
    return (
        <>
            <Label className={css.label}>Role</Label>
            {isBotAgent && <RoleLabel role={{ name: role }} />}
            {!isBotAgent && (
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
            )}
            {ORDERED_ROLES_META_BY_USER_ROLE.map(([key, orderedRole]) => {
                const id = `detail-role-${key}`
                return (
                    !isBotAgent && (
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
                )
            })}
        </>
    )
}
