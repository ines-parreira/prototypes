import {fromJS, List, Map} from 'immutable'
import {getLDClient} from 'utils/launchDarkly'

import {FeatureFlagKey} from 'config/featureFlags'
import browserNotification from 'services/browserNotification'
import {isTabActive} from 'utils'

const ldClient = getLDClient()

const notifyOnNewMessage = async (
    previousTicket: Map<any, any>,
    ticketRecord: Map<any, any>
) => {
    try {
        await ldClient.waitForInitialization(3)
    } catch (e) {}

    const isTicketMessageCreatedEnabled = !!getLDClient().variation(
        FeatureFlagKey.NotificationsTicketMessageCreated,
        false
    )

    // notification on new message while not on tab
    if (!isTabActive() && !isTicketMessageCreatedEnabled) {
        const messagesLength = (
            ticketRecord.get('messages', fromJS([])) as List<any>
        ).size
        const previousMessagesLength = (
            previousTicket.get('messages', fromJS([])) as List<any>
        ).size

        const newMessage = (
            ticketRecord.get('messages', fromJS([])) as List<any>
        ).last() as Map<any, any>

        if (
            messagesLength !== previousMessagesLength &&
            newMessage &&
            !newMessage.get('from_agent')
        ) {
            const title = newMessage.getIn(['sender', 'name']) as string
            const body = newMessage.get('body_text') as string
            browserNotification.newMessage({title, body})
        }
    }
}

export default notifyOnNewMessage
