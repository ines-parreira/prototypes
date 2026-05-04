import { useRef } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useSidebar } from '@repo/navigation'
import { history } from '@repo/routing'
import { isMacOs, useShortcuts } from '@repo/utils'
import { useLocation } from 'react-router-dom'

import {
    Box,
    Button,
    DropdownIcon,
    Icon,
    Menu,
    MenuItem,
    ShortcutKey,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import {
    DEFAULT_ERROR_MESSAGE,
    MICROPHONE_PERMISSION_ERROR_MESSAGE,
} from 'business/twilio'
import { useCreateTicketButton } from 'pages/common/components/CreateTicket/useCreateTicketButton'
import PhoneDevice from 'pages/integrations/integration/components/phone/PhoneDevice'

import { usePlaceCallButton } from './usePlaceCallButton'

const BUTTON_CONTENT_WIDTH = 184

export function TicketNavbarCreateMenu() {
    const { pathname } = useLocation()
    const isCreateTicketDisabled = pathname.includes('/ticket/new')
    const {
        hasDraft,
        onResumeDraft,
        onDiscardDraft,
        createTicketActions,
        createTicketPath,
    } = useCreateTicketButton()
    useShortcuts('CreateTicketButton', createTicketActions)

    const { isCollapsed } = useSidebar()

    const buttonRef = useRef<HTMLButtonElement>(null)

    const {
        isDeviceVisible,
        setIsDeviceVisible,
        shouldDisplayButton: shouldDisplayPlaceCall,
        isDeviceActive,
        isButtonDisabled: isPlaceCallButtonDisabled,
        hasPhone,
    } = usePlaceCallButton()

    const handleCreateTicket = () => {
        history.push(createTicketPath)
        logEvent(SegmentEvent.CreateTicketButtonClicked)
    }

    if (!hasPhone && !hasDraft) {
        return (
            <Box>
                {isCollapsed ? (
                    <Tooltip
                        placement="right"
                        trigger={
                            <Button
                                icon="add-plus-circle"
                                variant="tertiary"
                                isDisabled={isCreateTicketDisabled}
                                onClick={handleCreateTicket}
                            />
                        }
                    >
                        <TooltipContent title="Create ticket" />
                    </Tooltip>
                ) : (
                    <Button
                        ref={buttonRef}
                        variant="secondary"
                        size="sm"
                        isDisabled={isCreateTicketDisabled}
                        onClick={handleCreateTicket}
                    >
                        <Box width={BUTTON_CONTENT_WIDTH}>
                            <Box alignItems="center" gap="xxxs">
                                <div>Create ticket</div>
                                <ShortcutKey>N</ShortcutKey>
                            </Box>
                        </Box>
                    </Button>
                )}
            </Box>
        )
    }

    return (
        <Box>
            <Menu
                trigger={({ isOpen }) =>
                    isCollapsed ? (
                        <Tooltip
                            placement="right"
                            trigger={
                                <Button
                                    icon="add-plus-circle"
                                    variant="tertiary"
                                />
                            }
                        >
                            <TooltipContent title="Create ticket" />
                        </Tooltip>
                    ) : (
                        <Button
                            ref={buttonRef}
                            variant="secondary"
                            size="sm"
                            trailingSlot={
                                <DropdownIcon isOpen={isOpen} size="xs" />
                            }
                        >
                            <Box width={BUTTON_CONTENT_WIDTH}>Create</Box>
                        </Button>
                    )
                }
            >
                {hasDraft ? (
                    <>
                        <MenuItem
                            label="Resume draft"
                            trailingSlot={<ShortcutKey>N</ShortcutKey>}
                            isDisabled={isCreateTicketDisabled}
                            onAction={onResumeDraft}
                        />
                        <MenuItem
                            label="Discard and create new ticket"
                            isDisabled={isCreateTicketDisabled}
                            onAction={() => onDiscardDraft(createTicketPath)}
                        />
                    </>
                ) : (
                    <MenuItem
                        label="Create ticket"
                        trailingSlot={<ShortcutKey>N</ShortcutKey>}
                        onAction={handleCreateTicket}
                    />
                )}
                {shouldDisplayPlaceCall && (
                    <MenuItem
                        label="Place call"
                        trailingSlot={
                            isPlaceCallButtonDisabled ? (
                                <Tooltip
                                    trigger={
                                        <Icon
                                            name="octagon-error"
                                            size="sm"
                                            color="red"
                                        />
                                    }
                                >
                                    <TooltipContent
                                        title={
                                            !isDeviceActive
                                                ? DEFAULT_ERROR_MESSAGE
                                                : MICROPHONE_PERMISSION_ERROR_MESSAGE
                                        }
                                    />
                                </Tooltip>
                            ) : (
                                <Box gap="xxxs">
                                    <ShortcutKey>
                                        {isMacOs ? '⌘' : 'ctrl'}
                                    </ShortcutKey>
                                    <ShortcutKey>E</ShortcutKey>
                                </Box>
                            )
                        }
                        isDisabled={isPlaceCallButtonDisabled}
                        onAction={() => setIsDeviceVisible(true)}
                    />
                )}
            </Menu>
            <PhoneDevice
                isOpen={isDeviceVisible}
                setIsOpen={setIsDeviceVisible}
                target={buttonRef}
            />
        </Box>
    )
}
