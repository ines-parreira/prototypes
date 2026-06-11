import { AlertBanner } from 'AlertBanners/components/AlertBanner'

import { Header } from './Header'
import { InfoCard } from './InfoCard'
import { Slides } from './Slides'
import type { ProductDetail } from './types'

import css from './Detail.less'

export function Detail(props: ProductDetail) {
    const {
        screenshots = [],
        longDescription,
        benefits,
        infocard,
        setupCards,
    } = props

    return (
        <>
            <Header {...props} />
            {props.alertBanner && <AlertBanner {...props.alertBanner} />}
            <main className={css.main}>
                <section>
                    <div className={css.longDescription}>
                        <h2>About</h2>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: longDescription,
                            }}
                        />
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
                    </div>

                    {screenshots && screenshots.length > 0 && (
                        <Slides screenshots={screenshots} />
                    )}
                </section>
                <div className={css.rightRail}>
                    {setupCards}
                    {!infocard?.isHidden && <InfoCard {...props.infocard} />}
                </div>
            </main>
        </>
    )
}
