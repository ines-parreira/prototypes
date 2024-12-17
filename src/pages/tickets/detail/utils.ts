import {Tag} from '@gorgias/api-queries'

import {TicketStatus} from 'business/types/ticket'
import {MacroActionName} from 'models/macroAction/types'
import {TicketElement, TicketMessage} from 'models/ticket/types'
import {isVoiceCall} from 'models/voiceCall/types'
import {TicketEventEnum} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

export const getActionAndTagsFromMessage = (
    allTags: Tag[],
    message?: TicketMessage
): {action: TicketEventEnum | null; tags: Tag[]} => {
    if (!message) {
        return {tags: [], action: null}
    }

    const messageTagNames = (message.actions
        ?.filter((action) => action.name === MacroActionName.AddTags)
        .map((action) => action.arguments?.tags) || []) as string[]

    const messageTags = messageTagNames
        ?.map((tagName) => allTags.find((tag) => tag.name === tagName))
        .filter(Boolean) as Tag[]

    const isHandover = message.actions?.some(
        (action) => action.name === MacroActionName.SetAssignee
    )

    const isSnoozed = message.actions?.some(
        (action) => action.name === MacroActionName.SnoozeTicket
    )

    const isClosed = message.actions?.some(
        (action) =>
            action.name === MacroActionName.SetStatus &&
            action.arguments?.status === TicketStatus.Closed
    )

    const actionType = isClosed
        ? TicketEventEnum.CLOSE
        : isSnoozed
          ? TicketEventEnum.SNOOZE
          : isHandover
            ? TicketEventEnum.ASSIGN_TICKET
            : null

    return {tags: messageTags, action: actionType}
}

export const getVoiceCallIndex = (
    voiceCallId: string,
    elements: ('header' | TicketElement | TicketMessage[])[]
): number | 'LAST' => {
    const index = elements.findIndex((element) => {
        if (element === 'header') return false

        return (
            isVoiceCall(element) &&
            element.id.toString() === voiceCallId.toString()
        )
    })

    return index === -1 ? 'LAST' : index
}
