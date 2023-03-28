import React, {FormEvent, RefObject, useMemo} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

import {getNewMessageType} from 'state/newMessage/selectors'
import {hasIntegrationOfTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {editorFocused} from 'state/ui/editor/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import ReplyMessageChannel from './ReplyArea/ReplyMessageChannel'
import PhoneTicketSubmitButtons from './ReplyArea/PhoneTicketSubmitButtons'
import TicketSubmitButtons from './ReplyArea/TicketSubmitButtons'
import TicketReplyArea from './ReplyArea/TicketReplyArea'

import css from './ReplyForm.less'

type ReplyFormProps = {
    formRef: RefObject<HTMLFormElement>
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    setTicketStatus: (status: TicketStatus) => void
}

const ReplyForm = ({formRef, onSubmit, setTicketStatus}: ReplyFormProps) => {
    const dispatch = useAppDispatch()
    const ticket = useAppSelector((state) => state.ticket)
    const sourceType = useAppSelector(getNewMessageType)
    const hasPhoneIntegration = useAppSelector(
        hasIntegrationOfTypes(IntegrationType.Phone)
    )
    const currentUser = useAppSelector((state) => state.currentUser)

    const isExistingTicket = useMemo(() => !!ticket.get('id'), [ticket])
    const hasPhoneChannel = useMemo(
        () =>
            (ticket.getIn(['customer', 'channels'], []) as Map<any, any>).some(
                (channel: Map<any, any>) =>
                    channel.get('type') === TicketChannel.Phone
            ),
        [ticket]
    )

    const shouldRenderPhoneButtons = useMemo(
        () =>
            hasPhoneIntegration &&
            sourceType === TicketMessageSourceType.Phone &&
            (!isExistingTicket || hasPhoneChannel),
        [hasPhoneIntegration, hasPhoneChannel, sourceType, isExistingTicket]
    )

    return (
        <div
            className={classnames('d-print-none', css.newMessageForm, {
                'mt-3': !isExistingTicket,
            })}
            onFocus={() => dispatch(editorFocused(true))}
            onBlur={() => dispatch(editorFocused(false))}
        >
            <form ref={formRef} id="ticket-reply-editor" onSubmit={onSubmit}>
                <ReplyMessageChannel />

                {shouldRenderPhoneButtons ? (
                    <PhoneTicketSubmitButtons />
                ) : (
                    <>
                        <TicketReplyArea
                            currentUser={currentUser}
                            ticket={ticket}
                        />

                        <TicketSubmitButtons
                            setTicketStatus={setTicketStatus}
                            ticket={ticket}
                        />
                    </>
                )}
            </form>
        </div>
    )
}

export default ReplyForm
