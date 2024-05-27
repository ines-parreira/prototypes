import {TicketStatus} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {MacroActionName} from 'models/macroAction/types'
import {Tag} from 'models/tag/types'
import {TicketMessage} from 'models/ticket/types'
import {getTags} from 'state/tags/selectors'
import {TicketEventEnum} from '../components/AIAgentFeedbackBar/types'

export const useAIAgentMessageEvents = (message?: TicketMessage) => {
    const allTags: Tag[] = useAppSelector(getTags).toJS()

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
