import {
    getMacroTicketFieldValues,
    useTicketFieldsValidation,
} from '@repo/tickets'
import { shortcutManager, shortcuts } from '@repo/utils'

import { Box, Button, toast, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { Macro } from '@gorgias/helpdesk-types'

import { TicketStatus } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import css from 'pages/tickets/detail/components/ReplyArea/TicketSubmitButtons.less'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider'
import {
    canSend as getCanSend,
    hasContent as getHasContent,
} from 'state/newMessage/selectors'
import {
    getAppliedMacro,
    hasAppliedMacroSetSubjectAction as getHasAppliedMacroSetSubjectAction,
    hasContentlessAction as getHasContentlessAction,
} from 'state/ticket/selectors'

type Props = {
    subject: string
    submit: (args: SubmitArgs) => any
}

export function NewTicketSubmitButtons({ subject, submit }: Props) {
    const { isTranslationPending } = useOutboundTranslationContext()
    const appliedMacro = useAppSelector(getAppliedMacro)

    const hasContent = useAppSelector(getHasContent)
    const newMessage = useAppSelector((state) => state.newMessage)
    const canSend = useAppSelector(getCanSend)
    const hasContentlessAction = useAppSelector(getHasContentlessAction)
    const hasAppliedMacroSetSubjectAction = useAppSelector(
        getHasAppliedMacroSetSubjectAction,
    )
    const { validateTicketFields } = useTicketFieldsValidation()

    const isLoading = newMessage.getIn([
        '_internal',
        'loading',
        'submitMessage',
    ])

    const showConfirm = !subject && !hasAppliedMacroSetSubjectAction
    const isButtonDisabled = !canSend || isTranslationPending
    const text = hasContent || !hasContentlessAction ? 'Send' : 'Apply Macro'
    const titleConfirmation =
        'Are you sure you want to create a ticket with no subject?'

    const handleSendAndCloseTicket = () => {
        const { hasErrors } = validateTicketFields(
            getMacroTicketFieldValues(appliedMacro?.toJS() as Macro),
        )

        if (hasErrors) {
            toast.error(
                'This ticket cannot be closed. Please fill the required fields.',
            )
            return
        }

        submit({ status: TicketStatus.Closed })
    }

    return (
        <div className={`${css.component} d-flex align-items-center`}>
            <Box className={css.buttons} id="submit-button-div" gap="xs">
                {!showConfirm ? (
                    <Button
                        id="submit-button"
                        type="submit"
                        isDisabled={isButtonDisabled}
                        tabIndex={5}
                        isLoading={isLoading}
                    >
                        {text}
                    </Button>
                ) : (
                    <ConfirmButton
                        id="submit-button"
                        type="submit"
                        confirmationContent={titleConfirmation}
                        isDisabled={isButtonDisabled}
                        tabIndex={5}
                        isLoading={isLoading}
                    >
                        {text}
                    </ConfirmButton>
                )}
                {canSend && (
                    <Tooltip
                        placement="top"
                        trigger={<span id="submit-button-shortcut" />}
                    >
                        <TooltipContent
                            shortcut={shortcutManager.getActionKeys(
                                shortcuts.TicketDetailContainer.actions
                                    .SUBMIT_TICKET,
                            )}
                        />
                    </Tooltip>
                )}
                {!showConfirm ? (
                    <Button
                        id="submit-and-close-button"
                        type="button"
                        variant="secondary"
                        isDisabled={isButtonDisabled}
                        onClick={handleSendAndCloseTicket}
                        isLoading={isLoading}
                    >
                        {`${text} & Close`}
                    </Button>
                ) : (
                    <ConfirmButton
                        id="submit-and-close-button"
                        type="button"
                        confirmationContent={titleConfirmation}
                        intent="secondary"
                        isDisabled={isButtonDisabled}
                        onConfirm={handleSendAndCloseTicket}
                        isLoading={isLoading}
                    >
                        {`${text} & Close`}
                    </ConfirmButton>
                )}
                {canSend && (
                    <Tooltip
                        placement="top"
                        trigger={<span id="submit-and-close-button-shortcut" />}
                    >
                        <TooltipContent
                            shortcut={shortcutManager.getActionKeys(
                                shortcuts.TicketDetailContainer.actions
                                    .SUBMIT_CLOSE_TICKET,
                            )}
                        />
                    </Tooltip>
                )}
            </Box>
        </div>
    )
}
