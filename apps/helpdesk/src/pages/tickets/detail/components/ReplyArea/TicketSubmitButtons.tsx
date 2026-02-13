import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import {
    getMacroTicketFieldValues,
    useHelpdeskV2MS1Flag,
    useTicketFieldsValidation,
} from '@repo/tickets'
import { shortcutManager, shortcuts } from '@repo/utils'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _sample from 'lodash/sample'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import type { Macro } from '@gorgias/helpdesk-types'

import { TicketStatus } from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { MacroActionName } from 'models/macroAction/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider'
import { submitSetting } from 'state/currentUser/actions'
import {
    isHidingTips as getIsHidingTips,
    getPreferences,
} from 'state/currentUser/selectors'
import {
    canSend as getCanSend,
    hasContent as getHasContent,
} from 'state/newMessage/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import {
    getAppliedMacro,
    hasContentlessAction as getHasContentlessAction,
} from 'state/ticket/selectors'

import css from './TicketSubmitButtons.less'

/* eslint-disable react/jsx-key */
const TIPS: ReactNode[] = [
    <span>
        Press <kbd>→</kbd> (right arrow) to go to next ticket
    </span>,
    <span>
        Press <kbd>←</kbd> (left arrow) to go to previous ticket
    </span>,
    <span>
        Press <kbd>c</kbd> to close the ticket
    </span>,
    <span>
        Press <kbd>o</kbd> to open the ticket
    </span>,
    <span>
        Press <kbd>#</kbd> to delete the ticket
    </span>,
    <span>
        Press <kbd>?</kbd> to display all keyboard shortcuts
    </span>,
    <span>
        Press <kbd>r</kbd> to reply to the ticket
    </span>,
    <span>
        Press <kbd>m</kbd> to display macros
    </span>,
    'You can add attachments to macros',
    'Insert order info as variables in macros',
]
/* eslint-enable */

type Props = {
    submit: (args: SubmitArgs) => any
}

export function TicketSubmitButtons({ submit }: Props) {
    const dispatch = useAppDispatch()

    const { isTranslationPending } = useOutboundTranslationContext()
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()
    const appliedMacro = useAppSelector(getAppliedMacro)
    const hasContent = useAppSelector(getHasContent)
    const currentUserPreferences = useAppSelector(getPreferences)
    const isHidingTips = useAppSelector(getIsHidingTips)
    const newMessage = useAppSelector((state) => state.newMessage)
    const canSend = useAppSelector(getCanSend)
    const hasContentlessAction = useAppSelector(getHasContentlessAction)
    const ticket = useAppSelector((state) => state.ticket)
    const { validateTicketFields } = useTicketFieldsValidation(
        Number(ticket.get('id')),
    )

    const tip = useMemo(() => _sample(TIPS), [])

    const trackSendAndClosedClicked = useCallback(() => {
        logEvent(SegmentEvent.TicketSendAndCloseButtonClicked, {
            ticketId: ticket.get('id'),
        })
    }, [ticket])

    const handleClickHideTips = useCallback(() => {
        const newPreferences = currentUserPreferences.setIn(
            ['data', 'hide_tips'],
            true,
        )
        return dispatch(submitSetting(newPreferences.toJS(), false))
    }, [currentUserPreferences, dispatch])

    const handleSendAndCloseTicket = useCallback(() => {
        if (!hasUIVisionMS1) {
            trackSendAndClosedClicked()
            submit({ status: TicketStatus.Closed })
        } else {
            const { hasErrors } = validateTicketFields(
                getMacroTicketFieldValues(appliedMacro?.toJS() as Macro),
            )

            if (!ticket.get('id') || hasErrors) {
                dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'This ticket cannot be closed. Please fill the required fields.',
                    }),
                )
                return
            }

            trackSendAndClosedClicked()
            submit({ status: TicketStatus.Closed })
        }
    }, [
        trackSendAndClosedClicked,
        hasUIVisionMS1,
        ticket,
        submit,
        validateTicketFields,
        dispatch,
        appliedMacro,
    ])

    const isLoading = newMessage.getIn([
        '_internal',
        'loading',
        'submitMessage',
    ])

    const isUpdating = !!ticket.get('id')
    const hasTitle = !!ticket.get('subject')
    const titleConfirmation =
        'Are you sure you want to create a ticket with no subject?'

    const actions = ticket.getIn(
        ['state', 'appliedMacro', 'actions'],
        fromJS([]),
    ) as List<Map<any, any>>

    const hasSetSubjectAction = actions.some(
        (action) => action?.get('name') === MacroActionName.SetSubject,
    )

    const text = hasContent || !hasContentlessAction ? 'Send' : 'Apply Macro'

    const showConfirm = !hasTitle && !isUpdating && !hasSetSubjectAction
    const isButtonDisabled = !canSend || isTranslationPending

    return (
        <div
            className={classnames(
                css.component,
                'd-flex align-items-center justify-content-between',
            )}
        >
            <div
                className={css.buttons}
                id="submit-button-div"
                data-candu-id="ticket-send-and-close-buttons"
            >
                {!showConfirm ? (
                    <Button
                        id="submit-button"
                        type="submit"
                        className="mr-2"
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
                        className="mr-2"
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
                        target="submit-button"
                        offset="0, 4px"
                    >
                        {shortcutManager.getActionKeys(
                            shortcuts.TicketDetailContainer.actions
                                .SUBMIT_TICKET,
                        )}
                    </Tooltip>
                )}
                {!showConfirm ? (
                    <Button
                        id="submit-and-close-button"
                        type="button"
                        intent="secondary"
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
                        target="submit-and-close-button"
                        offset="0, 4px"
                    >
                        {shortcutManager.getActionKeys(
                            shortcuts.TicketDetailContainer.actions
                                .SUBMIT_CLOSE_TICKET,
                        )}
                    </Tooltip>
                )}
            </div>
            {!isHidingTips && (
                <small
                    className={classnames(
                        css.tip,
                        'text-faded d-none d-md-inline-block',
                    )}
                >
                    <i className="material-icons md-1 mr-1 align-text-bottom">
                        info
                    </i>
                    {tip}
                    <i
                        id="hide-helpers-button"
                        className="material-icons md-1 cursor-pointer ml-1 mr-1 align-text-bottom"
                        onClick={handleClickHideTips}
                    >
                        close
                    </i>
                    <Tooltip placement="top" target="hide-helpers-button">
                        Permanently hide tips
                    </Tooltip>
                </small>
            )}
        </div>
    )
}

export default TicketSubmitButtons
