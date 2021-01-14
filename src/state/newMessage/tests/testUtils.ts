import {MessageContext} from '../responseUtils'
import {convertToHTML} from '../../../utils/editor'

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
