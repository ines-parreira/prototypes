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
    } = usePlaceCallButton()

    return (
        <>
            <Menu
                trigger={({ isOpen }) =>
                    isCollapsed ? (
                        <Button
                            icon="add-plus-circle"
                            size="sm"
                            variant="secondary"
                        />
                    ) : (
                        <Button
                            ref={buttonRef}
                            variant="secondary"
                            size="sm"
                            trailingSlot={
                                <DropdownIcon isOpen={isOpen} size="xs" />
                            }
                        >
                            Create ticket
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
                        onAction={() => {
                            history.push(createTicketPath)
                            logEvent(SegmentEvent.CreateTicketButtonClicked)
                        }}
                    />
                )}
                {shouldDisplayPlaceCall && (
                    <MenuItem
                        label="Place call"
                        trailingSlot={
                            isPlaceCallButtonDisabled ? (
                                <Tooltip
                                    trigger={
                                        <span role="button" tabIndex={0}>
                                            <Icon
                                                name="octagon-error"
                                                size="sm"
                                                color="red"
                                            />
                                        </span>
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
        </>
    )
}
