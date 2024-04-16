import React, {ComponentProps, useState} from 'react'
import {
    TransferCallBodyReceiverType,
    TransferCallBodyType,
    useTransferCall,
} from '@gorgias/api-queries'
import {Call} from '@twilio/voice-sdk'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Button from 'pages/common/components/button/Button'
import {AgentLabel} from 'pages/common/utils/labels'
import {getHumanAgentsJS} from 'state/agents/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUserId} from 'state/currentUser/selectors'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCallSid} from 'hooks/integrations/phone/utils'
import DropdownSection from '../../dropdown/DropdownSection'
import css from './CallTransferDropdown.less'

type Props = Pick<
    ComponentProps<typeof Dropdown>,
    'isOpen' | 'target' | 'placement'
> & {
    onTransferInitiated: () => void
    setIsOpen: (isOpen: boolean) => void
    call: Call
}

export default function CallTransferDropdown({
    isOpen,
    setIsOpen,
    target,
    placement = 'top',
    onTransferInitiated,
    call,
}: Props) {
    const [selectedAgent, setSelectedAgent] = useState<number | null>(null)
    const dispatch = useAppDispatch()

    const {mutate: transferCall, isLoading: isRequestingTransfer} =
        useTransferCall({
            mutation: {
                onSuccess: () => {
                    setIsOpen(false)
                    onTransferInitiated()
                },
                onError: () => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Call transfer failed',
                        })
                    )
                },
            },
        })

    const agents = useAppSelector(getHumanAgentsJS)
    const currentAgentId = useAppSelector(getCurrentUserId)

    const filteredAgents = agents.filter((agent) => agent.id !== currentAgentId)

    const handleTransferCallClick = () => {
        if (!selectedAgent) return

        transferCall({
            data: {
                type: TransferCallBodyType.Cold,
                receiver_type: TransferCallBodyReceiverType.Agent,
                receiver_id: selectedAgent,
                call_sid: getCallSid(call),
            },
        })
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={setIsOpen}
            target={target}
            placement={placement}
            className={css.container}
            value={selectedAgent}
        >
            <DropdownSearch />
            <DropdownBody className={css.dropdownBody}>
                <DropdownSection title="Agents">
                    {filteredAgents.map((option) => (
                        <DropdownItem
                            key={`agent-${option.id}`}
                            option={{
                                label: `${option.name}`,
                                value: option.id,
                            }}
                            onClick={setSelectedAgent}
                        >
                            <AgentLabel
                                shouldDisplayAvatar
                                name={option.name}
                                profilePictureUrl={
                                    option.meta?.profile_picture_url
                                }
                            />
                        </DropdownItem>
                    ))}
                </DropdownSection>
            </DropdownBody>
            <div className={css.dropdownFooter}>
                <Button
                    className={css.cta}
                    isDisabled={!selectedAgent}
                    onClick={handleTransferCallClick}
                    isLoading={isRequestingTransfer}
                >
                    Transfer call
                </Button>
            </div>
        </Dropdown>
    )
}
