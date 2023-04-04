import React, {ReactNode} from 'react'

import css from './ChatIntegrationPreview.less'

type Props = {
    children?: ReactNode
}

const ChatIntegrationPreviewContent = ({children}: Props) => {
    return <div className={css.content}>{children}</div>
}

export default ChatIntegrationPreviewContent
