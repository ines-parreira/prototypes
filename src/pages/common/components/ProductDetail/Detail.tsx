import React from 'react'

import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import Header from './Header'
import Slides from './Slides'
import InfoCard from './InfoCard'
import {ProductDetail} from './types'

import css from './Detail.less'

export default function Detail(props: ProductDetail) {
    const {screenshots = [], longDescription, benefits, infocard} = props

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
                    <h2>About</h2>
                    <div dangerouslySetInnerHTML={{__html: longDescription}} />
                    {benefits && benefits.length > 0 && (
                        <>
                            <h2>Benefits</h2>
                            <ul>
                                {benefits.map((benefit, index) => (
                                    <li
                                        key={index}
                                        dangerouslySetInnerHTML={{
                                            __html: benefit,
                                        }}
                                    />
                                ))}
                            </ul>
                        </>
                    )}
                    {screenshots && screenshots.length > 0 && (
                        <Slides screenshots={screenshots} />
                    )}
                </section>
                {!infocard?.isHidden && <InfoCard {...props.infocard} />}
            </main>
        </>
    )
}
