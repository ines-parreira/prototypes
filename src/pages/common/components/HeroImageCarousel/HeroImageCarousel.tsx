import React, {useRef, useState} from 'react'
import Slider from 'react-slick'
import classNames from 'classnames'

import Button from '../button/Button'
import css from './HeroImageCarousel.less'
export type CarouselData = {
    imageUrl: string
    description?: string
    header?: string
}
type Props = {
    slides: CarouselData[]
    singleSlideButtonTitle?: string
    onSingleSlideButtonTitleClick?: () => void
}

const HeroImageCarousel = ({
    slides,
    singleSlideButtonTitle,
    onSingleSlideButtonTitleClick,
}: Props) => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const sliderRef = useRef<Slider | null>(null)
    return (
        <div className={css.container}>
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
                                    width={420}
                                    height={420}
                                    className={css.slideImage}
                                    src={imageUrl}
                                    alt={description}
                                />
                                {description && (
                                    <div className={css.slideDescription}>
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
