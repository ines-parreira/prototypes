import React from 'react'

import battery from 'assets/img/battery.svg'
import wifi from 'assets/img/wifi.svg'

import css from './SmsChannelMessagesContainer.less'

export const SmsChannelMessagesContainer: React.FC<{
    children: React.ReactNode
    storeName?: string
}> = ({ children, storeName }) => {
    const currentTime = new Date().toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    })

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.statusBar}>
                    <div className={css.time}>{currentTime}</div>

                    <div className={css.statusIcons}>
                        <img className={css.wifiIcon} src={wifi} alt="wifi" />
                        <img
                            className={css.batteryIcon}
                            src={battery}
                            alt="battery"
                        />
                    </div>
                </div>
                {storeName && (
                    <div className={css.storeTitle}>
                        <span>{storeName}</span>
                    </div>
                )}
            </div>
            <div className={css.messagesContainer}>{children}</div>
        </div>
    )
}
