import { AlertBanner } from 'AlertBanners/components/AlertBanner'

import Header from './Header'
import InfoCard from './InfoCard'
import Slides from './Slides'
import { ProductDetail } from './types'

import css from './Detail.less'

export default function Detail(props: ProductDetail) {
    const { screenshots = [], longDescription, benefits, infocard } = props

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

                {!infocard.isHidden && (
                    <InfoCard {...{ ...props.infocard, type: props.type }} />
                )}
            </main>
        </>
    )
}
