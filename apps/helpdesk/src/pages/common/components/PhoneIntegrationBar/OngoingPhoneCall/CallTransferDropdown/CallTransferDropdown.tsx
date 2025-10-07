import { ComponentProps, useState } from 'react'

import { Call } from '@twilio/voice-sdk'
import { get } from 'lodash'

import { Button } from '@gorgias/axiom'
import {
    useTransferCall,
    VoiceCallTransferType,
} from '@gorgias/helpdesk-queries'

import { getCallSid } from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { UserSearchResult } from 'models/search/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownAlertBanner, {
    AlertBannerData,
} from 'pages/common/components/dropdown/DropdownAlertBanner'
import AgentCallTransferDropdownContent from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/AgentCallTransferDropdownContent'
import ExternalCallTransferDropdownContent from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/ExternalCallTransferDropdownContent'
import QueueCallTransferDropdownContent from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/QueueCallTransferDropdownContent'
import {
    TransferTarget,
    TransferType,
} from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/types'
import { getTransferReceiverData } from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/utils'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './CallTransferDropdown.less'

type Props = Pick<
    ComponentProps<typeof Dropdown>,
    'isOpen' | 'target' | 'placement'
> & {
    onTransferInitiated: (transferringTo: TransferTarget | null) => void
    setIsOpen: (isOpen: boolean) => void
    call: Call
    integrationPhoneNumberId?: number
}

const CallTransferDropdown = ({
    isOpen,
    setIsOpen,
    target,
    placement = 'top',
    onTransferInitiated,
    call,
    integrationPhoneNumberId,
}: Props) => {
    const [selectedTransferType, setSelectedTransferType] =
        useState<TransferType>(TransferType.Agent)
    const [selectedTarget, setSelectedTarget] = useState<TransferTarget | null>(
        null,
    )
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)

    const [selectedQueueId, setSelectedQueueId] = useState<number | null>(null)

    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false)
    const [alertBannerData, setAlertBannerData] =
        useState<AlertBannerData | null>(null)
    const clearAlertBannerData = () => setAlertBannerData(null)

    const isTransferEnabled =
        selectedTarget !== null &&
        (selectedTarget.type !== TransferType.External || isPhoneNumberValid)

    const handleSelectedAgentIdChange = (agentId: number) => {
        setSelectedAgentId(agentId)
        setSelectedTarget({ type: TransferType.Agent, id: agentId })
    }
    const handleSelectedQueueIdChange = (queueId: number) => {
        setSelectedQueueId(queueId)
        setSelectedTarget({ type: TransferType.Queue, id: queueId })
    }
    const handlePhoneNumberValidationChange = (isValid: boolean) => {
        setIsPhoneNumberValid(isValid)
        clearAlertBannerData()
    }

    const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>('')
    const [selectedCustomer, setSelectedCustomer] = useState<
        UserSearchResult | undefined
    >(undefined)
    const handleSelectedExternalPhoneNumberChange = (
        phoneNumber: string,
        customer?: UserSearchResult,
    ) => {
        setSelectedPhoneNumber(phoneNumber)
        setSelectedCustomer(customer)
        setSelectedTarget({
            type: TransferType.External,
            value: phoneNumber,
            customer: customer
                ? {
                      id: customer.customer.id,
                      name: customer.customer.name,
                  }
                : null,
        })
    }

    const handleSelectedTransferTypeChange = (transferType: TransferType) => {
        setSelectedTransferType(transferType)
        switch (transferType) {
            case TransferType.Agent:
                if (selectedAgentId) {
                    handleSelectedAgentIdChange(selectedAgentId)
                } else {
                    setSelectedTarget(null)
                }
                break
            case TransferType.Queue:
                if (selectedQueueId) {
                    handleSelectedQueueIdChange(selectedQueueId)
                } else {
                    setSelectedTarget(null)
                }
                break
            case TransferType.External:
                if (selectedPhoneNumber !== '') {
                    handleSelectedExternalPhoneNumberChange(
                        selectedPhoneNumber,
                        selectedCustomer,
                    )
                } else {
                    setSelectedTarget(null)
                }
                break
            default:
                setSelectedTarget(null)
        }
    }

    const getSelectedDropdownValue = (): number | null => {
        switch (selectedTransferType) {
            case TransferType.Agent:
                return selectedAgentId
            case TransferType.Queue:
                return selectedQueueId
            default:
                return null
        }
    }

    const dispatch = useAppDispatch()
    const { mutate: transferCall, isLoading: isRequestingTransfer } =
        useTransferCall({
            mutation: {
                onSuccess: () => {
                    setIsOpen(false)
                    onTransferInitiated(selectedTarget)
                },
                onError: (error) => {
                    const message =
                        get(error, 'response.data.error.msg') ??
                        'Call transfer failed because an error occurred. Please try again.'
                    const isWarning = error.response?.status === 400

                    void dispatch(
                        notify({
                            status: isWarning
                                ? NotificationStatus.Warning
                                : NotificationStatus.Error,
                            message,
                        }),
                    )
                    setAlertBannerData({
                        message: isWarning
                            ? 'Transfer unsuccessful. Please try again.'
                            : 'Transfer failed. Please try again.',
                        type: isWarning ? 'warning' : 'error',
                    })
                },
            },
        })

    const handleTransferCall = () => {
        if (!isTransferEnabled) {
            return
        }

        transferCall({
            data: {
                type: VoiceCallTransferType.Cold,
                ...getTransferReceiverData(selectedTarget),
                call_sid: getCallSid(call),
            },
        })
    }

    return (
        <Dropdown
            key={selectedTransferType}
            isOpen={isOpen}
            onToggle={setIsOpen}
            target={target}
            placement={placement}
            className={css.container}
            value={getSelectedDropdownValue()}
        >
            <div className={css.toggleContainer}>
                <ToggleButton.Wrapper
                    type={ToggleButton.Type.Label}
                    value={selectedTransferType}
                    onChange={handleSelectedTransferTypeChange}
                    size="small"
                    className={css.toggleButtonWrapper}
                >
                    <ToggleButton.Option value={TransferType.Agent}>
                        Agents
                    </ToggleButton.Option>
                    <ToggleButton.Option value={TransferType.Queue}>
                        Queues
                    </ToggleButton.Option>
                    <ToggleButton.Option value={TransferType.External}>
                        External
                    </ToggleButton.Option>
                </ToggleButton.Wrapper>
            </div>
            {selectedTransferType === TransferType.Agent && (
                <AgentCallTransferDropdownContent
                    setSelectedAgentId={handleSelectedAgentIdChange}
                    clearErrors={() => setAlertBannerData(null)}
                />
            )}
            {selectedTransferType === TransferType.Queue && (
                <QueueCallTransferDropdownContent
                    setSelectedQueueId={handleSelectedQueueIdChange}
                    clearErrors={() => setAlertBannerData(null)}
                />
            )}
            {selectedTransferType === TransferType.External && (
                <ExternalCallTransferDropdownContent
                    phoneNumber={selectedPhoneNumber}
                    customer={selectedCustomer}
                    setSelectedExternalPhoneNumber={
                        handleSelectedExternalPhoneNumberChange
                    }
                    handleTransferCall={handleTransferCall}
                    onPhoneNumberValidationChange={
                        handlePhoneNumberValidationChange
                    }
                    integrationPhoneNumberId={integrationPhoneNumberId}
                />
            )}
            <div className={css.dropdownFooter}>
                <DropdownAlertBanner
                    data={alertBannerData}
                    onClear={clearAlertBannerData}
                    autoDismiss
                />
                <Button
                    className={css.cta}
                    isDisabled={!isTransferEnabled}
                    onClick={handleTransferCall}
                    isLoading={isRequestingTransfer}
                >
                    Transfer call
                </Button>
            </div>
        </Dropdown>
    )
}

export default CallTransferDropdown
