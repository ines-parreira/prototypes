import React, {FormEvent, useMemo, useRef} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

import {getNewMessageType} from 'state/newMessage/selectors'
import {hasIntegrationOfTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {editorFocused} from 'state/ui/editor/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {SubmitArgs} from '../TicketDetailContainer'
import ReplyMessageChannel from './ReplyArea/ReplyMessageChannel'
import PhoneTicketSubmitButtons from './ReplyArea/PhoneTicketSubmitButtons'
import TicketSubmitButtons from './ReplyArea/TicketSubmitButtons'
import TicketReplyArea from './ReplyArea/TicketReplyArea'

import css from './ReplyForm.less'

type ReplyFormProps = {
    submit: (params: SubmitArgs) => any
}

const ReplyForm = ({submit}: ReplyFormProps) => {
    const statusParamsRef = useRef<SubmitArgs>({})
    const newMessageFormRef = useRef<HTMLFormElement>(null)

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

    const handlePreSubmit = ({
        status,
        next,
        action,
        resetMessage,
    }: SubmitArgs) => {
        if (newMessageFormRef?.current?.checkValidity()) {
            statusParamsRef.current = {status, next, action, resetMessage}
        } else {
            statusParamsRef.current = {}
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // https://github.com/gorgias/gorgias/issues/4074
        if (e.target !== newMessageFormRef.current) {
            return
        }

        Object.values(statusParamsRef.current).length &&
            submit(statusParamsRef.current)
    }

    return (
        <div
            className={classnames('d-print-none', css.newMessageForm, {
                'mt-3': !isExistingTicket,
            })}
            onFocus={() => dispatch(editorFocused(true))}
            onBlur={() => dispatch(editorFocused(false))}
        >
            <form
                onSubmit={handleSubmit}
                ref={newMessageFormRef}
                id="ticket-reply-editor"
            >
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
                            ticket={ticket}
                            submit={handlePreSubmit}
                        />
                    </>
                )}
            </form>
        </div>
    )
}

export default ReplyForm
