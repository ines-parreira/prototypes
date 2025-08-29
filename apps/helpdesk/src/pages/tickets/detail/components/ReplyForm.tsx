import { PropsWithChildren, useMemo } from 'react'

import { Map } from 'immutable'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { hasIntegrationOfTypes } from 'state/integrations/selectors'
import { getNewMessageType } from 'state/newMessage/selectors'

import PhoneTicketSubmitButtons from './ReplyArea/PhoneTicketSubmitButtons'

const ReplyForm = ({ children }: PropsWithChildren<unknown>) => {
    const ticket = useAppSelector((state) => state.ticket)
    const sourceType = useAppSelector(getNewMessageType)
    const hasPhoneIntegration = useAppSelector(
        hasIntegrationOfTypes(IntegrationType.Phone),
    )

    const isExistingTicket = useMemo(() => !!ticket.get('id'), [ticket])
    const hasPhoneChannel = useMemo(
        () =>
            (ticket.getIn(['customer', 'channels'], []) as Map<any, any>).some(
                (channel: Map<any, any>) =>
                    channel.get('type') === TicketChannel.Phone,
            ),
        [ticket],
    )

    const shouldRenderPhoneButtons = useMemo(
        () =>
            hasPhoneIntegration &&
            sourceType === TicketMessageSourceType.Phone &&
            (!isExistingTicket || hasPhoneChannel),
        [hasPhoneIntegration, hasPhoneChannel, sourceType, isExistingTicket],
    )

    return shouldRenderPhoneButtons ? (
        <PhoneTicketSubmitButtons />
    ) : (
        <>{children}</>
    )
}

export default ReplyForm
