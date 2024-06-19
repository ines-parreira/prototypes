import {TicketStatus} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {MacroActionName} from 'models/macroAction/types'
import {Tag} from 'models/tag/types'
import {TicketMessage} from 'models/ticket/types'
import {TicketEventEnum} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import {getTags} from 'state/tags/selectors'

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
        .filter((tag) => !!tag && tag.name.indexOf('ai_') !== 0) as Tag[]

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

type ActionAndTags = {
    action: TicketEventEnum | null
    tags: Tag[]
}

export const useAIAgentMessageEvents = (
    messages?: TicketMessage[]
): ActionAndTags[] => {
    const allTags: Tag[] = useAppSelector(getTags).toJS()

    if (!messages) {
        return []
    }

    return messages.map((message) =>
        getActionAndTagsFromMessage(allTags, message)
    )
}
