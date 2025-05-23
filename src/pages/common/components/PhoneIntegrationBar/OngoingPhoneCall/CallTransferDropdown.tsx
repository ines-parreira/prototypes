import React, { ComponentProps, useState } from 'react'

import { Call } from '@twilio/voice-sdk'
import { get } from 'lodash'

import {
    ListUsersRelationshipsItem,
    useListUsers,
    useTransferCall,
    VoiceCallTransferReceiverType,
    VoiceCallTransferType,
} from '@gorgias/helpdesk-queries'

import { getCallSid } from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import { AgentLabel } from 'pages/common/utils/labels'
import { getHumanAgentsJS } from 'state/agents/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import DropdownSection from '../../dropdown/DropdownSection'
import { getAvailabilityBadgeColor, mergeAgentData } from './utils'

import css from './CallTransferDropdown.less'

type Props = Pick<
    ComponentProps<typeof Dropdown>,
    'isOpen' | 'target' | 'placement'
> & {
    onTransferInitiated: (transferringTo: number | null) => void
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

    const { data: agentsDataWithStatus } = useListUsers(
        {
            limit: 100,
            relationships: [ListUsersRelationshipsItem.AvailabilityStatus],
        },
        {
            http: {
                paramsSerializer: {
                    indexes: null,
                },
            },
            query: {
                enabled: !!isOpen,
            },
        },
    )

    const { mutate: transferCall, isLoading: isRequestingTransfer } =
        useTransferCall({
            mutation: {
                onSuccess: () => {
                    setIsOpen(false)
                    onTransferInitiated(selectedAgent)
                },
                onError: (error) => {
                    const message =
                        get(error, 'response.data.error.msg') ??
                        'Call transfer failed because an error occurred. Please try again.'

                    void dispatch(
                        notify({
                            status:
                                error.response?.status === 400
                                    ? NotificationStatus.Info
                                    : NotificationStatus.Error,
                            message,
                        }),
                    )
                },
            },
        })

    const agents = useAppSelector(getHumanAgentsJS)
    const currentAgentId = useAppSelector(getCurrentUserId)

    const filteredAgents = agents.filter((agent) => agent.id !== currentAgentId)
    const mergedAgentData = mergeAgentData(
        filteredAgents,
        agentsDataWithStatus?.data?.data,
    )

    const handleTransferCallClick = () => {
        if (!selectedAgent) return

        transferCall({
            data: {
                type: VoiceCallTransferType.Cold,
                receiver_type: VoiceCallTransferReceiverType.Agent,
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
                    {mergedAgentData.map((option) => (
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
                                badgeColor={getAvailabilityBadgeColor(
                                    option.status,
                                )}
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
