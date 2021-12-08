import React, {useCallback, useMemo} from 'react'

import {useSelector} from 'react-redux'
import {UncontrolledTooltip} from 'reactstrap'

import {Map} from 'immutable'

import classnames from 'classnames'
import _debounce from 'lodash/debounce'

import type {RootState} from '../../../../../../state/types'

import * as segmentTracker from '../../../../../../store/middlewares/segmentTracker.js'
import {DEPRECATED_getTicket} from '../../../../../../state/ticket/selectors'
import {TicketState} from '../../../../../../state/ticket/types'
import {getCurrentAccountState} from '../../../../../../state/currentAccount/selectors'
import {CurrentAccountState} from '../../../../../../state/currentAccount/types'
import {getCurrentUser} from '../../../../../../state/currentUser/selectors'
import {CurrentUserState} from '../../../../../../state/currentUser/types'

import {MacroButton} from './MacroButton'

import css from './MacrosQuickReply.less'

type Props = {
    macros: Map<any, any>
    applyMacro: (macro: Map<any, any>) => void
}

export const MacrosQuickReply = ({macros, applyMacro}: Props) => {
    const ticket = useSelector<RootState, TicketState>(DEPRECATED_getTicket)
    const account = useSelector<RootState, CurrentAccountState>(
        getCurrentAccountState
    )
    const user = useSelector<RootState, CurrentUserState>(getCurrentUser)

    const baseSegmentPayload = useMemo(
        () => ({
            account_domain: account.get('domain'),
            user_id: user.get('id'),
            ticket_id: ticket.get('id'),
        }),
        [account, user, ticket]
    )

    const buttonHandleHover = useCallback(
        (macroId, macroRank) => {
            segmentTracker.logEvent(
                segmentTracker.EVENTS.MACROS_QUICK_REPLY_GET_DETAILS,
                {...baseSegmentPayload, macroId, macroRank}
            )
        },
        [baseSegmentPayload]
    )

    return (
        <div className={css.wrapper}>
            <div className={css.info}>
                <UncontrolledTooltip target="macro-suggestion-info">
                    <div className={css.tooltip}>
                        Macros are suggested based on the conversation content.
                        Use macros to save time answering tickets.
                    </div>
                </UncontrolledTooltip>
                <i
                    className={classnames('material-icons', 'mr-2')}
                    id="macro-suggestion-info"
                    onMouseEnter={() =>
                        segmentTracker.logEvent(
                            segmentTracker.EVENTS.MACROS_QUICK_REPLY_TOOLTIP,
                            baseSegmentPayload
                        )
                    }
                >
                    info_outline
                </i>
                Suggested macros
            </div>
            <div className={css.macros}>
                {macros.map((macro: Map<any, any>, macroRank: number) => (
                    <MacroButton
                        macro={macro.toJS()}
                        applyMacro={() => {
                            void applyMacro(macro)
                            segmentTracker.logEvent(
                                segmentTracker.EVENTS.MACROS_QUICK_REPLY_SENT,
                                {
                                    ...baseSegmentPayload,
                                    macro_id: macro.get('id'),
                                    macro_rank: macroRank + 1,
                                }
                            )
                        }}
                        key={macro.get('id')}
                        onHover={_debounce(
                            () =>
                                buttonHandleHover(
                                    macro.get('id'),
                                    macroRank + 1
                                ),
                            500
                        )}
                    />
                ))}
            </div>
        </div>
    )
}

export default MacrosQuickReply
