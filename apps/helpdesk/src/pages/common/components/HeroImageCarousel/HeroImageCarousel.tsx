import { useRef, useState } from 'react'

import classNames from 'classnames'
import _isString from 'lodash/isString'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { SliderRef } from 'utils/wrappers/Slider'
import Slider from 'utils/wrappers/Slider'

import css from './HeroImageCarousel.less'

export type CarouselData = {
    imageUrl: string
    description?: string | JSX.Element
    header?: string
    footerButton?: string
}
type Props = {
    slides: CarouselData[]
    width?: number
    singleSlideButtonTitle?: string
    onSingleSlideButtonTitleClick?: () => void
    classNameHeader?: string
    classNameDescription?: string
    classNameImage?: string
    classNameSlideAction?: string
    classNameActionIcon?: string
    onClose?: () => void
}

const HeroImageCarousel = ({
    slides,
    width = 420,
    singleSlideButtonTitle,
    onSingleSlideButtonTitleClick,
    classNameHeader,
    classNameDescription,
    classNameImage,
    classNameSlideAction,
    classNameActionIcon,
    onClose,
}: Props) => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const sliderRef = useRef<SliderRef | null>(null)

    const buttonLabel = slides[currentSlide].footerButton
    const handleButtonClick = () => {
        if (currentSlide === slides.length - 1) {
            onClose?.()
        } else {
            sliderRef.current?.slickNext()
        }
    }

    return (
        <div style={{ maxWidth: `${width}px` }}>
            <div className={css.sliderWrapper}>
                <Slider
                    beforeChange={(oldIndex, newIndex) => {
                        setCurrentSlide(newIndex)
                    }}
                    ref={sliderRef}
                    arrows={false}
                    infinite={false}
                    speed={350}
                >
                    {slides.map(({ imageUrl, description, header }, i) => {
                        return (
                            <div key={i}>
                                {header && (
                                    <div
                                        className={classNames(
                                            css.header,
                                            classNameHeader,
                                        )}
                                    >
                                        {header}
                                    </div>
                                )}
                                <img
                                    width={width}
                                    className={classNames(
                                        css.slideImage,
                                        classNameImage,
                                    )}
                                    src={imageUrl}
                                    alt={
                                        _isString(description)
                                            ? description
                                            : header
                                    }
                                />
                                {description && (
                                    <div
                                        className={classNames(
                                            css.slideDescription,
                                            classNameDescription,
                                        )}
                                        style={{ maxWidth: `${width}px` }}
                                    >
                                        {description}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </Slider>
            </div>

            {slides.length === 1 ? (
                singleSlideButtonTitle ? (
                    <div className={css.slideAction}>
                        <Button
                            fillStyle="ghost"
                            onClick={onSingleSlideButtonTitleClick}
                        >
                            {singleSlideButtonTitle}
                        </Button>
                    </div>
                ) : null
            ) : (
                <div>
                    <div
                        className={classNames(
                            css.slideAction,
                            classNameSlideAction,
                        )}
                    >
                        <i
                            onClick={() => sliderRef.current?.slickPrev()}
                            className={classNames(
                                'material-icons',
                                css.actionIcon,
                                classNameActionIcon,
                                {
                                    [css.disabled]: currentSlide === 0,
                                },
                            )}
                        >
                            chevron_left
                        </i>
                        <div className={css.slideDot}>
                            {slides.map((_, i) => (
                                <div
                                    className={classNames({
                                        [css.current]: currentSlide === i,
                                    })}
                                    key={i}
                                />
                            ))}
                        </div>
                        <i
                            onClick={() => sliderRef.current?.slickNext()}
                            className={classNames(
                                'material-icons',
                                css.actionIcon,
                                classNameActionIcon,
                                {
                                    [css.disabled]:
                                        currentSlide === slides.length - 1,
                                },
                            )}
                        >
                            chevron_right
                        </i>
                    </div>
                    {buttonLabel && (
                        <Button
                            className={css.footerButton}
                            onClick={handleButtonClick}
                        >
                            {buttonLabel}
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
export default HeroImageCarousel
