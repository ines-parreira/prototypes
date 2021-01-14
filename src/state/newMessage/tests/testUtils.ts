import {MessageContext} from '../responseUtils'
import {
    convertToHTML,
    BlockSnapshot,
    getContentStateBlocksSnapshot,
} from '../../../utils/editor'
import {ReplyAreaState} from '../types'

export type MessageContextSnapshot = Omit<MessageContext, 'contentState'> & {
    contentState: string
}

export const getMessageContextSnapshot = ({
    action,
    state,
    contentState,
    ...context
}: MessageContext): MessageContextSnapshot => {
    const {args} = action
    const argsContentState = args.get('contentState')
    return {
        ...context,
        action: {
            ...action,
            args: argsContentState
                ? args.set('contentState', convertToHTML(argsContentState))
                : args,
        },
        contentState: convertToHTML(contentState),
        state: state.setIn(
            ['state', 'contentState'],
            convertToHTML(state.getIn(['state', 'contentState']))
        ),
    }
}

export type ReplyAreaStateSnapshot = Omit<
    ReplyAreaState,
    'contentState' | 'selectionState'
> & {
    contentState: BlockSnapshot[]
}

export const getReplyAreaStateSnapshot = (
    replyAreaState: ReplyAreaState
): ReplyAreaStateSnapshot => {
    const snapshot = {
        ...replyAreaState,
        contentState: getContentStateBlocksSnapshot(
            replyAreaState.contentState
        ),
    }
    delete snapshot.selectionState
    return snapshot
}
