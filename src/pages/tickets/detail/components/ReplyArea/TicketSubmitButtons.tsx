import React, {ReactNode, useCallback, useMemo} from 'react'
import _sample from 'lodash/sample'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import {Tooltip} from '@gorgias/ui-kit'

import {logEvent, SegmentEvent} from 'common/segment'
import {TicketStatus} from 'business/types/ticket'
import keymap from 'config/shortcuts'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {MacroActionName} from 'models/macroAction/types'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import shortcutManager from 'services/shortcutManager'
import {submitSetting} from 'state/currentUser/actions'
import {
    getPreferences,
    isHidingTips as getIsHidingTips,
} from 'state/currentUser/selectors'
import {
    canSend as getCanSend,
    hasContent as getHasContent,
} from 'state/newMessage/selectors'
import {hasContentlessAction as getHasContentlessAction} from 'state/ticket/selectors'

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
    setTicketStatus: (status: TicketStatus) => void
}

export function TicketSubmitButtons({setTicketStatus}: Props) {
    const dispatch = useAppDispatch()

    const hasContent = useAppSelector(getHasContent)
    const currentUserPreferences = useAppSelector(getPreferences)
    const isHidingTips = useAppSelector(getIsHidingTips)
    const newMessage = useAppSelector((state) => state.newMessage)
    const canSend = useAppSelector(getCanSend)
    const hasContentlessAction = useAppSelector(getHasContentlessAction)
    const ticket = useAppSelector((state) => state.ticket)

    const tip = useMemo(() => _sample(TIPS), [])

    const trackSendAndClosedClicked = useCallback(() => {
        logEvent(SegmentEvent.TicketSendAndCloseButtonClicked, {
            ticketId: ticket.get('id'),
        })
    }, [ticket])

    const handleClickHideTips = useCallback(() => {
        const newPreferences = currentUserPreferences.setIn(
            ['data', 'hide_tips'],
            true
        )
        return dispatch(submitSetting(newPreferences.toJS(), false))
    }, [currentUserPreferences, dispatch])

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
        fromJS([])
    ) as List<Map<any, any>>

    const hasSetSubjectAction = actions.some(
        (action) => action?.get('name') === MacroActionName.SetSubject
    )

    const text = hasContent || !hasContentlessAction ? 'Send' : 'Apply Macro'

    const showConfirm = !hasTitle && !isUpdating && !hasSetSubjectAction

    return (
        <div
            className={classnames(
                css.component,
                'd-flex align-items-center justify-content-between'
            )}
        >
            <div
                className={classnames(css.buttons)}
                id="submit-button-div"
                data-candu-id="ticket-send-and-close-buttons"
            >
                {!showConfirm ? (
                    <Button
                        id="submit-button"
                        type="submit"
                        className="mr-2"
                        isDisabled={!canSend}
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
                        isDisabled={!canSend}
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
                            keymap.TicketDetailContainer.actions.SUBMIT_TICKET
                        )}
                    </Tooltip>
                )}
                {!showConfirm ? (
                    <Button
                        id="submit-and-close-button"
                        type="submit"
                        intent="secondary"
                        isDisabled={!canSend}
                        onClick={() => {
                            trackSendAndClosedClicked()
                            setTicketStatus(TicketStatus.Closed)
                        }}
                        isLoading={isLoading}
                    >
                        {text} &amp; Close
                    </Button>
                ) : (
                    <ConfirmButton
                        id="submit-and-close-button"
                        type="submit"
                        confirmationContent={titleConfirmation}
                        intent="secondary"
                        isDisabled={!canSend}
                        onConfirm={() => {
                            trackSendAndClosedClicked()
                            setTicketStatus(TicketStatus.Closed)
                        }}
                        isLoading={isLoading}
                    >
                        {text} &amp; Close
                    </ConfirmButton>
                )}
                {canSend && (
                    <Tooltip
                        placement="top"
                        target="submit-and-close-button"
                        offset="0, 4px"
                    >
                        {shortcutManager.getActionKeys(
                            keymap.TicketDetailContainer.actions
                                .SUBMIT_CLOSE_TICKET
                        )}
                    </Tooltip>
                )}
            </div>
            {!isHidingTips && (
                <small
                    className={classnames(
                        css.tip,
                        'text-faded d-none d-md-inline-block'
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
