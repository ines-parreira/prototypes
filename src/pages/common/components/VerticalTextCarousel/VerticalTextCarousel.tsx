import React, { useEffect, useState } from 'react'

import classnames from 'classnames'

import css from './VerticalTextCarousel.less'

export type VerticalTextCarouselProps = {
    texts: string[]
    cta?: React.ReactNode
    ctaSuccessMessage?: string
    onCtaClick?: (text: string) => void
}

export const VerticalTextCarousel = ({
    texts,
    cta,
    ctaSuccessMessage,
    onCtaClick,
}: VerticalTextCarouselProps) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [clickedTextIndex, setClickedTextIndex] = useState<number | null>(
        null,
    )

    useEffect(() => {
        setCurrentTextIndex(0)
        setClickedTextIndex(null)
    }, [texts])

    const handlePrev = () => {
        setCurrentTextIndex((prev) => (prev - 1 + texts.length) % texts.length)
    }

    const handleNext = () => {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length)
    }

    const handleCtaClick = () => {
        setClickedTextIndex(currentTextIndex)
        onCtaClick && onCtaClick(texts[currentTextIndex])
    }

    if (!texts.length) {
        return null
    }

    return (
        <div className={css.wrapper}>
            <div className={classnames(css.row, css.mainContent)}>
                <div
                    className={classnames(
                        clickedTextIndex === currentTextIndex
                            ? css.clicked
                            : '',
                        css.suggestion,
                        css.row,
                    )}
                >
                    {texts[currentTextIndex]}
                    {cta && (
                        <div onClick={handleCtaClick} className={css.cta}>
                            {cta}
                        </div>
                    )}
                </div>
                <div className={css.controls}>
                    <i
                        className={`material-icons ${css.topArrow}`}
                        onClick={handlePrev}
                        role={'button'}
                        aria-label="Previous"
                        tabIndex={0}
                    >
                        expand_less
                    </i>
                    <i
                        className={`material-icons ${css.bottomArrow}`}
                        onClick={handleNext}
                        role={'button'}
                        aria-label="Next"
                        tabIndex={0}
                    >
                        expand_more
                    </i>
                </div>
            </div>
            {clickedTextIndex !== null && ctaSuccessMessage && (
                <div className={classnames(css.row, css.clickedInfoMessage)}>
                    {ctaSuccessMessage}
                </div>
            )}
        </div>
    )
}
