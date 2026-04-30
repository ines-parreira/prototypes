import type { ComponentProps } from 'react'

import css from './EditorReplyChannelContainer.less'

export function EditorReplyChannelContainer(props: ComponentProps<'div'>) {
    return <div className={css.replyChannel} {...props} />
}
