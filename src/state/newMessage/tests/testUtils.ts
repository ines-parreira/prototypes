import _omit from 'lodash/omit'

import {MessageContext} from '../responseUtils'
import {
    convertToHTML,
    BlockSnapshot,
    getContentStateBlocksSnapshot,
    getContentStateSelectionSnapshot,
    ContentStateSelectionSnapshot,
} from '../../../utils/editor'
import {ReplyAreaState} from '../types'

export type MessageContextSnapshot = Omit<
    MessageContext,
    'contentState' | 'selectionState'
> & {
    contentState: string
    selectionState?: ContentStateSelectionSnapshot
}

export const getMessageContextSnapshot = ({
    action,
    state,
    contentState,
    selectionState,
    ...context
}: MessageContext): MessageContextSnapshot => {
    const {args} = action
    const argsContentState = args.get('contentState')
    const snapshot: MessageContextSnapshot = {
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

    if (selectionState) {
        snapshot.selectionState = getContentStateSelectionSnapshot(
            contentState,
            selectionState
        )
    }

    return snapshot
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
    const snapshot: ReplyAreaStateSnapshot = {
        ..._omit(replyAreaState, 'selectionState'),
        contentState: getContentStateBlocksSnapshot(
            replyAreaState.contentState
        ),
    }
    return snapshot
}
