import { shortcutManager, shortcuts } from '@repo/utils'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import css from 'pages/tickets/detail/components/ReplyArea/TicketSubmitButtons.less'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider'
import {
    canSend as getCanSend,
    hasContent as getHasContent,
} from 'state/newMessage/selectors'
import { hasContentlessAction as getHasContentlessAction } from 'state/ticket/selectors'

type Props = {
    subject: string
}

export function NewTicketSubmitButtons({ subject }: Props) {
    const { isTranslationPending } = useOutboundTranslationContext()

    const hasContent = useAppSelector(getHasContent)
    const newMessage = useAppSelector((state) => state.newMessage)
    const canSend = useAppSelector(getCanSend)
    const hasContentlessAction = useAppSelector(getHasContentlessAction)

    const isLoading = newMessage.getIn([
        '_internal',
        'loading',
        'submitMessage',
    ])

    const showConfirm = !subject
    const isButtonDisabled = !canSend || isTranslationPending
    const text = hasContent || !hasContentlessAction ? 'Send' : 'Apply Macro'

    return (
        <div className={`${css.component} d-flex align-items-center`}>
            <div className={css.buttons} id="submit-button-div">
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
                        confirmationContent="Are you sure you want to create a ticket with no subject?"
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
            </div>
        </div>
    )
}
