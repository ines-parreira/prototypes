import { Fragment } from 'react'

import { LegacyLabel as Label, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { UserRole } from 'config/types/user'
import { ORDERED_ROLES_META_BY_USER_ROLE } from 'config/user'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import { RoleLabel } from 'pages/common/utils/labels'
import { STANDALONE_AI_ALLOWED_ROLES } from 'providers/standalone-ai/constants'
import { useStandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'

import type { AgentState } from './types'

import css from './Detail.less'

type Props = {
    role: UserRole
    setAgentState: (arg1: (state: AgentState) => AgentState) => void
    isSelf: boolean
    isInternal: boolean
    isViewingAccountOwner: boolean
}

export const Role = ({
    role,
    setAgentState,
    isSelf,
    isInternal,
    isViewingAccountOwner,
}: Props) => {
    const isDisabled = isSelf || isViewingAccountOwner
    const { isStandaloneAiAgent } = useStandaloneAiContext()

    const visibleRoles = isStandaloneAiAgent
        ? ORDERED_ROLES_META_BY_USER_ROLE.filter(([key]) =>
              STANDALONE_AI_ALLOWED_ROLES.has(key),
          )
        : ORDERED_ROLES_META_BY_USER_ROLE

    return (
        <>
            <Label className={css.label}>Role</Label>
            {isInternal && <RoleLabel role={{ name: role }} />}
            {!isInternal && (
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
            {visibleRoles.map(([key, orderedRole]) => {
                const id = `detail-role-${key}`
                return (
                    !isInternal && (
                        <Fragment key={key}>
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
                        </Fragment>
                    )
                )
            })}
        </>
    )
}
