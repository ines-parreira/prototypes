import React from 'react'

import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import Header from './Header'
import Slides from './Slides'
import InfoCard from './InfoCard'
import {ProductDetail} from './types'

import css from './Detail.less'

export default function Detail(props: ProductDetail) {
    const {screenshots = [], longDescription, infocard} = props

    return (
        <>
            <Header {...props} />
            {props.notification && (
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
                    {screenshots && screenshots.length > 0 && (
                        <Slides screenshots={screenshots} />
                    )}
                </section>
                {!infocard?.isHidden && <InfoCard {...props.infocard} />}
            </main>
        </>
    )
}
