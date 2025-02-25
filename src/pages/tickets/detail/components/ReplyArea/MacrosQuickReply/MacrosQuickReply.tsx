import React, { useCallback, useMemo } from 'react'

import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import { UncontrolledTooltip } from 'reactstrap'

import { Macro } from '@gorgias/api-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { CurrentAccountState } from 'state/currentAccount/types'
import { getCurrentUser } from 'state/currentUser/selectors'
import { CurrentUserState } from 'state/currentUser/types'
import { DEPRECATED_getTicket } from 'state/ticket/selectors'
import { TicketState } from 'state/ticket/types'

import { MacroButton } from './MacroButton'

import css from './MacrosQuickReply.less'

type Props = {
    macros: Macro[]
    applyMacro: (macro: Macro) => void
}

export const MacrosQuickReply = ({ macros, applyMacro }: Props) => {
    const ticket = useAppSelector<TicketState>(DEPRECATED_getTicket)
    const account = useAppSelector<CurrentAccountState>(getCurrentAccountState)
    const user = useAppSelector<CurrentUserState>(getCurrentUser)

    const baseSegmentPayload = useMemo(
        () => ({
            account_domain: account.get('domain'),
            user_id: user.get('id'),
            ticket_id: ticket.get('id'),
        }),
        [account, user, ticket],
    )

    const buttonHandleHover = useCallback(
        (macroId, macroRank) => {
            logEvent(SegmentEvent.MacrosQuickReplyGetDetails, {
                ...baseSegmentPayload,
                macroId,
                macroRank,
            })
        },
        [baseSegmentPayload],
    )

    return (
        <div className={css.wrapper}>
            <div className={css.info}>
                <UncontrolledTooltip target="macro-suggestion-info">
                    <div className={css.tooltip}>
                        Macros are suggested based on your previous macro usage.
                        Use macros to save time answering tickets.
                    </div>
                </UncontrolledTooltip>
                <i
                    className={classnames('material-icons', 'mr-2')}
                    id="macro-suggestion-info"
                    onMouseEnter={() =>
                        logEvent(
                            SegmentEvent.MacrosQuickReplyTooltip,
                            baseSegmentPayload,
                        )
                    }
                >
                    info_outline
                </i>
                Suggested macros
            </div>
            <div className={css.macros}>
                {macros.map((macro, macroRank: number) => (
                    <MacroButton
                        macro={macro}
                        applyMacro={() => {
                            void applyMacro(macro)
                            logEvent(SegmentEvent.MacrosQuickReplySent, {
                                ...baseSegmentPayload,
                                macro_id: macro.id,
                                macro_rank: macroRank + 1,
                            })
                        }}
                        key={macro.id}
                        onHover={_debounce(
                            () => buttonHandleHover(macro.id, macroRank + 1),
                            500,
                        )}
                    />
                ))}
            </div>
        </div>
    )
}

export default MacrosQuickReply
