import React from 'react'
import css from './PlaygroundThread.less'

type Props = {
    subject?: string
    threadContent?: React.ReactNode
    actions?: React.ReactNode
}

const PlaygroundThread = ({subject, threadContent, actions}: Props) => {
    return (
        <div className={css.playgroundThreadContainer}>
            {subject && <div className={css.header}>{subject}</div>}
            <div className={css.threadContent}>{threadContent}</div>
            {actions && (
                <div>
                    <div className={css.bodyBottomBorderContainer} />
                    <div className={css.footer}>{actions}</div>
                </div>
            )}
        </div>
    )
}

export default PlaygroundThread
