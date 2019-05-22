import React from 'react'
import classnames from 'classnames'

import css from './ChatIntegrationPreview.less'


type Props = {
    quickReplies: Array<string>,
    mainColor?: string
}

export default class QuickReplies extends React.Component<Props> {
    render() {
        const {quickReplies, mainColor} = this.props

        return (
            <div className={classnames(css.content, css['quick-replies-content'])}>
                <div className={css['quick-replies-wrapper']}>
                    {
                        quickReplies.map((quickReply, index) => (
                            <button
                                key={`${quickReply}-${index}`}
                                className={classnames('btn btn-reply-action', css.reply)}
                                style={{
                                    color: mainColor,
                                    borderColor: mainColor,
                                }}
                            >
                                {quickReply}
                            </button>
                        ))
                    }
                </div>
            </div>
        )
    }
}
