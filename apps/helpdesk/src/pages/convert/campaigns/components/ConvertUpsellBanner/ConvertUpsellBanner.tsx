import { LegacyButton as Button } from '@gorgias/axiom'

import { assetsUrl } from 'utils'

import css from './ConvertUpsellBanner.less'

const ConvertUpsellBanner = () => {
    return (
        <div className={css.container}>
            <div className={css.bannerContent}>
                <div className={css.leftContent}>
                    <h3 className={css.title}>
                        Maximize your sales: Unlock up to 10% lift in GMV.
                    </h3>
                    <p className={css.content}>
                        Launch personalized campaigns based on visitor behavior
                        for increased sales. Include product suggestions or a
                        unique discount code with just one click!
                    </p>
                    <div className={css.buttonGroup}>
                        <div className={css.buttonWrapper}>
                            <a
                                href="https://www.gorgias.com/products/convert"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button intent="secondary">Learn More</Button>
                            </a>
                        </div>
                    </div>
                </div>
                <div className={css.preview}>
                    <img
                        src={assetsUrl(
                            '/img/presentationals/convert-upsell-banner.png',
                        )}
                        alt="Convert subscription features preview"
                    />
                </div>
            </div>
        </div>
    )
}

export default ConvertUpsellBanner
