import type { ReactNode } from 'react'
import type React from 'react'

import css from './ChatIntegrationPreview.less'

type Props = {
    children?: ReactNode
    style?: React.CSSProperties
}

const ChatIntegrationPreviewContent = ({ children, style }: Props) => {
    return (
        <div className={css.content} style={style}>
            {children}
        </div>
    )
}

export default ChatIntegrationPreviewContent
