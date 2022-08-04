import React, {useState, useEffect} from 'react'

import warningIcon from 'assets/img/icons/warning.svg'

import {
    HELP_CENTER_MAX_ARTICLES,
    HELP_CENTER_MAX_ARTICLES_WARNING_THRESHOLD,
} from '../../constants'

import OpenChatButton from './components/OpenChatButton'
import css from './MaxArticleBanner.less'

type Props = {
    nbArticles: number
    maxArticles?: number
    warningThreshold?: number
}

const MaxArticleBanner = ({
    nbArticles,
    maxArticles = HELP_CENTER_MAX_ARTICLES,
    warningThreshold = HELP_CENTER_MAX_ARTICLES_WARNING_THRESHOLD,
}: Props) => {
    const shouldDisplayWarning = nbArticles >= warningThreshold
    const isLimitReached = nbArticles >= maxArticles

    const [isShowingBanner, setIsShowingBanner] = useState(
        isLimitReached || shouldDisplayWarning
    )

    useEffect(() => {
        if (!isShowingBanner && (isLimitReached || shouldDisplayWarning)) {
            setIsShowingBanner(true)
        } else if (isShowingBanner && !shouldDisplayWarning) {
            setIsShowingBanner(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nbArticles, isLimitReached, shouldDisplayWarning])

    const message = isLimitReached
        ? `Each Help Center is limited to ${maxArticles} articles, please contact us to increase the authorized maximum number of articles.`
        : `Your Help Center currently contains ${nbArticles} articles out of ${maxArticles} authorized articles. Please contact us to increase the limit.`

    return isShowingBanner ? (
        <div className={css.banner}>
            <div className={css.info}>
                <img src={warningIcon} alt="warning icon" />
                <div className={css.bannerLabel}>{message}</div>
            </div>
            <div className={css.actions}>
                <OpenChatButton label="Contact Us" />
                <button
                    aria-label="close"
                    className={css.closeBannerButton}
                    onClick={() => setIsShowingBanner(false)}
                >
                    <i className="material-icons">close</i>
                </button>
            </div>
        </div>
    ) : null
}

export default MaxArticleBanner
