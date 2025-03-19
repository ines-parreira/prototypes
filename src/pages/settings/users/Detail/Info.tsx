import { Tooltip } from '@gorgias/merchant-ui-kit'

import { useInviteAgent } from 'hooks/agents/useInviteAgent'
import useDebouncedValue from 'hooks/useDebouncedValue'
import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'

import { AgentState } from './types'

import css from './Detail.less'

type Props = {
    name: string
    email: string
    isEdit: boolean
    agentId: number
    isViewingAccountOwner: boolean
    isAccountOwner: boolean
    isBotAgent: boolean
    setAgentState: (arg1: (state: AgentState) => AgentState) => void
}

export const Info = ({
    name,
    email,
    isEdit,
    agentId,
    isViewingAccountOwner,
    isAccountOwner,
    isBotAgent,
    setAgentState,
}: Props) => {
    const { mutate: inviteAgent, isLoading: isInviting } = useInviteAgent(email)
    const isDebouncedInviting = useDebouncedValue(isInviting, 500)
    const isDisabled = isEdit && isViewingAccountOwner && !isAccountOwner

    const nameId = 'detail-info-name-input'
    const emailId = 'detail-info-email-input'

    return (
        <>
            <InputField
                className={css.inputField}
                id={nameId}
                name="name"
                label="Name"
                value={name}
                onChange={(value) =>
                    setAgentState((previousState) => ({
                        ...previousState,
                        name: value,
                    }))
                }
                placeholder="Robin McHelpful"
                isRequired
                isDisabled={isDisabled}
            />
            {isDisabled && (
                <Tooltip target={nameId}>You cannot edit account owner</Tooltip>
            )}
            <InputField
                className={css.inputField}
                id={emailId}
                type="email"
                name="email"
                label="Email"
                value={email}
                onChange={(value) =>
                    setAgentState((previousState) => ({
                        ...previousState,
                        email: value,
                    }))
                }
                placeholder="robin@mchelpful.com"
                isRequired
                isDisabled={isBotAgent || isDisabled}
            />

            {isDisabled && (
                <Tooltip target={emailId}>
                    You cannot edit account owner
                </Tooltip>
            )}
            {isEdit && !isBotAgent && (
                <Button
                    className={css.inputField}
                    type="button"
                    intent="secondary"
                    onClick={() => {
                        inviteAgent([agentId])
                    }}
                    isLoading={isDebouncedInviting}
                    leadingIcon="mail"
                >
                    Resend invite
                </Button>
            )}
        </>
    )
}
