import React from 'react'

import { ConnectedChannelsChatView } from './components/ConnectedChannelsChatView'

import css from './ConnectedChannelsView.less'

export const ConnectedChannelsView = () => {
    return (
        <div className={css.pageContainer}>
            <div
                className={css.settingsContainer}
                ref={(e) => {
                    if (!e) return
                    const isOverflowing = e.scrollHeight > e.clientHeight
                    if (isOverflowing) {
                        e.classList.remove(css.fullHeight)
                    } else {
                        e.classList.add(css.fullHeight)
                    }
                }}
            >
                <ConnectedChannelsChatView />
            </div>
        </div>
    )
}
