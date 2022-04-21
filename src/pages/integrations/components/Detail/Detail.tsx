import React from 'react'

import {IntegrationConfig} from 'config'
import {AppDetail, isAppDetail} from 'models/integration/types/app'
import BannerNotification, {
    Props as BannerProps,
} from 'pages/common/components/BannerNotifications/BannerNotification'
import Header from './Header'
import Slides from './Slides'
import InfoCard from './InfoCard'

import css from './Detail.less'

export default function Detail(
    props:
        | AppDetail
        | (IntegrationConfig & {
              connectUrl: string
              isExternalConnectUrl: boolean
              notification?: BannerProps
              isConnectionDisabled?: boolean
          })
) {
    const {screenshots = [], longDescription} = props

    return (
        <>
            <Header {...props} />
            {!isAppDetail(props) && props.notification && (
                <BannerNotification
                    {...props.notification}
                    borderless
                    showIcon
                    dismissible={false}
                />
            )}
            <main className={css.main}>
                <section className={css.longDescription}>
                    <h2 className={css.categoryTitle}>About</h2>
                    <div dangerouslySetInnerHTML={{__html: longDescription}} />
                    <Slides
                        isApp={isAppDetail(props)}
                        screenshots={screenshots}
                    />
                </section>
                <InfoCard
                    {...props}
                    disabledMessage={
                        (!isAppDetail(props) &&
                            props.isConnectionDisabled &&
                            props.notification?.message) ||
                        ''
                    }
                />
            </main>
        </>
    )
}
