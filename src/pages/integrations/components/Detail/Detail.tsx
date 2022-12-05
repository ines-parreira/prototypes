import React from 'react'

import {isAppDetail} from 'models/integration/types/app'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import Header from './Header'
import Slides from './Slides'
import InfoCard, {InfoCardProps} from './InfoCard'

import css from './Detail.less'

export default function Detail(props: InfoCardProps) {
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
                <InfoCard {...props} />
            </main>
        </>
    )
}
