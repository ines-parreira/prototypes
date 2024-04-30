import React, {useRef, useState} from 'react'
import Slider from 'react-slick'
import classNames from 'classnames'

import _isString from 'lodash/isString'
import Button from '../button/Button'
import css from './HeroImageCarousel.less'

export type CarouselData = {
    imageUrl: string
    description?: string | JSX.Element
    header?: string
}
type Props = {
    slides: CarouselData[]
    width?: number
    singleSlideButtonTitle?: string
    onSingleSlideButtonTitleClick?: () => void
}

const HeroImageCarousel = ({
    slides,
    width = 420,
    singleSlideButtonTitle,
    onSingleSlideButtonTitleClick,
}: Props) => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const sliderRef = useRef<Slider | null>(null)
    return (
        <div style={{maxWidth: `${width}px`}}>
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
                    {slides.map(({imageUrl, description, header}, i) => {
                        return (
                            <div key={i}>
                                {header && (
                                    <div className={css.header}>{header}</div>
                                )}
                                <img
                                    width={width}
                                    className={css.slideImage}
                                    src={imageUrl}
                                    alt={
                                        _isString(description)
                                            ? description
                                            : header
                                    }
                                />
                                {description && (
                                    <div
                                        className={css.slideDescription}
                                        style={{maxWidth: `${width}px`}}
                                    >
                                        {description}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </Slider>
            </div>

            {slides.length === 1 && singleSlideButtonTitle ? (
                <div className={css.slideAction}>
                    <Button
                        fillStyle="ghost"
                        onClick={onSingleSlideButtonTitleClick}
                    >
                        {singleSlideButtonTitle}
                    </Button>
                </div>
            ) : (
                <div className={css.slideAction}>
                    <i
                        onClick={() => sliderRef.current?.slickPrev()}
                        className={classNames(
                            'material-icons',
                            css.actionIcon,
                            {
                                [css.disabled]: currentSlide === 0,
                            }
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
                            {
                                [css.disabled]:
                                    currentSlide === slides.length - 1,
                            }
                        )}
                    >
                        chevron_right
                    </i>
                </div>
            )}
        </div>
    )
}
export default HeroImageCarousel
