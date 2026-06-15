import { useRef } from 'react'

import {
    NavigationSidebarTooltip,
    useSidebar,
    useSidebarButtonSize,
} from '@repo/navigation'
import { history } from '@repo/routing'
import { isMacOs, useShortcuts } from '@repo/utils'
import { useLocation } from 'react-router-dom'

import {
    Box,
    Button,
    Icon,
    Menu,
    MenuItem,
    MultiButton,
    ShortcutKey,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import {
    DEFAULT_ERROR_MESSAGE,
    MICROPHONE_PERMISSION_ERROR_MESSAGE,
} from 'business/twilio'
import { useCreateTicketButton } from 'pages/common/components/CreateTicket/useCreateTicketButton'
import { PhoneDevice } from 'pages/integrations/integration/components/phone/PhoneDevice'

import { usePlaceCallButton } from './usePlaceCallButton'
import css from './TicketNavbarCreateMenu.less'

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
    const buttonSize = useSidebarButtonSize()

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
    }

    if (isCollapsed) {
        if (!hasPhone && !hasDraft) {
            return (
                <NavigationSidebarTooltip
                    placement="right"
                    trigger={
                        <Button
                            icon="add-plus-circle"
                            variant="tertiary"
                            size={buttonSize}
                            isDisabled={isCreateTicketDisabled}
                            onClick={handleCreateTicket}
                        />
                    }
                >
                    <TooltipContent title="Create ticket" />
                </NavigationSidebarTooltip>
            )
        }

        return (
            <Box>
                <Menu
                    trigger={() => (
                        <NavigationSidebarTooltip
                            placement="right"
                            trigger={
                                <Button
                                    icon="add-plus-circle"
                                    variant="tertiary"
                                    size={buttonSize}
                                />
                            }
                        >
                            <TooltipContent title="Create ticket" />
                        </NavigationSidebarTooltip>
                    )}
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
                                onAction={() =>
                                    onDiscardDraft(createTicketPath)
                                }
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
                                                name="error-octagon"
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

    return (
        <Box gap="xxxs">
            {hasDraft ? (
                <Tooltip
                    trigger={
                        <Box>
                            <MultiButton variant="secondary" size="sm">
                                <Button
                                    isDisabled={isCreateTicketDisabled}
                                    onClick={onResumeDraft}
                                >
                                    Resume draft
                                </Button>
                                <Button
                                    icon="close"
                                    isDisabled={isCreateTicketDisabled}
                                    aria-label="Discard draft"
                                    onClick={() =>
                                        onDiscardDraft(createTicketPath)
                                    }
                                />
                            </MultiButton>
                        </Box>
                    }
                >
                    <TooltipContent>
                        <Box
                            flexDirection="column"
                            gap="xxxs"
                            className={css.draftTooltipContent}
                        >
                            <Box alignItems="center" gap="xxxs">
                                <Text>Resume draft</Text>
                                <ShortcutKey>N</ShortcutKey>
                            </Box>
                            <div>
                                Close button - Discard and create new ticket
                            </div>
                        </Box>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <Button
                    variant="secondary"
                    size="sm"
                    isDisabled={isCreateTicketDisabled}
                    onClick={handleCreateTicket}
                    leadingSlot="chat-add-circle"
                    trailingSlot={<ShortcutKey>N</ShortcutKey>}
                >
                    New ticket
                </Button>
            )}
            {shouldDisplayPlaceCall && (
                <Tooltip
                    trigger={
                        <Button
                            variant="secondary"
                            size="sm"
                            isDisabled={isPlaceCallButtonDisabled}
                            onClick={() => setIsDeviceVisible(true)}
                            ref={buttonRef}
                            leadingSlot="phone-outgoing"
                            trailingSlot={
                                isPlaceCallButtonDisabled ? (
                                    <Icon
                                        name="error-octagon"
                                        size="sm"
                                        color="red"
                                    />
                                ) : (
                                    <Box gap="xxxs">
                                        <ShortcutKey>
                                            {isMacOs ? '⌘' : 'ctrl'}
                                        </ShortcutKey>
                                        <ShortcutKey>E</ShortcutKey>
                                    </Box>
                                )
                            }
                        >
                            Call
                        </Button>
                    }
                >
                    {isPlaceCallButtonDisabled && (
                        <TooltipContent
                            title={
                                !isDeviceActive
                                    ? DEFAULT_ERROR_MESSAGE
                                    : MICROPHONE_PERMISSION_ERROR_MESSAGE
                            }
                        />
                    )}
                </Tooltip>
            )}
            <PhoneDevice
                isOpen={isDeviceVisible}
                setIsOpen={setIsDeviceVisible}
                target={buttonRef}
            />
        </Box>
    )
}
