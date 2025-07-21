import { motion } from 'framer-motion'

import { FieldPresentation } from 'AIJourney/components'
import lightningIcon from 'assets/img/ai-journey/lightning.svg'
import sneakerIcon from 'assets/img/ai-journey/sneaker.svg'
import speedometerIcon from 'assets/img/ai-journey/speedometer.svg'

import css from './AdditionalInfo.less'

export const AdditionalInfo = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className={css.infoText}
        >
            <div className={css.onboardingAdditionalInfo}>
                <div className={css.headerInfo}>
                    <img src={lightningIcon} alt="lightning" />
                    <FieldPresentation
                        name="SMS Abandoned Cart"
                        description="Stop leaving money on the table, let the Abandoned Cart Journey reclaim missed sales."
                    />
                </div>
                <div className={css.demo}>
                    <div className={css.productImage}>
                        <img src={sneakerIcon} alt="sneaker" />
                    </div>
                    <div className={css.textContainer}>
                        <span className={css.primaryText}>
                            Hey Max, grab your pair now with a special discount
                            just for you.
                        </span>
                        <span className={css.secondaryText}>
                            <span className={css.oldPrice}>$199</span> $159
                        </span>
                    </div>
                </div>
                <div className={css.revenueGrow}>
                    <div className={css.speedometerImage}>
                        <img src={speedometerIcon} alt="speedometer" />
                        <span className={css.revenueIncreaveValue}>+$56K</span>
                    </div>
                    <span className={css.revenueGrowText}>
                        Based on abandoned cart data from the past{' '}
                        <span className={css.bold}>30 days</span>, you could
                        have generated an additional{' '}
                        <span className={css.bold}>$56,000</span> in revenue.
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
