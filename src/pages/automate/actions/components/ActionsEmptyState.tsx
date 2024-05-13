import React from 'react'

import chatImage from 'assets/img/actions/chat.png'

import css from './ActionsEmptyState.less'

export default function ActionsEmptyState() {
    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.intro}>
                    <div className={css.infoContainer}>
                        <p className={css.title}>
                            Configure Actions for AI Agent
                        </p>
                        <p className={css.description}>
                            Actions enable AI Agent to perform tasks with your
                            3rd party apps such as create return label, cancel
                            order, get order status, issue refund and more.
                        </p>
                    </div>
                </div>
                <div className={css.chatImageContainer}>
                    <img
                        className={css.chatImage}
                        src={chatImage}
                        alt="Actions chat"
                    />
                </div>
            </div>
        </div>
    )
}
