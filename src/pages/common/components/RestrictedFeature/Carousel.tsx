import React, {MouseEvent} from 'react'
import Slider from 'react-slick'

import css from './Carousel.less'

type Props = {
    arrows?: boolean
    autoplay?: boolean
    imagesUrl: string[]
    slidesToShow?: number
    onImageClick?: (img: {url: string; index: number; e: MouseEvent}) => void
}

export default function Carousel({
    imagesUrl,
    onImageClick,
    arrows = false,
    autoplay = true,
    slidesToShow = 2,
}: Props) {
    return (
        <div className={css.carouselContainer}>
            <Slider
                dots
                slidesToShow={slidesToShow}
                arrows={arrows}
                autoplay={autoplay}
                autoplaySpeed={3000}
            >
                {imagesUrl.map((url, index) => (
                    <div key={index} className={css.carouselContent}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <img
                                alt="carousel content"
                                src={url}
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (onImageClick) {
                                        onImageClick({url, index, e})
                                    }
                                }}
                            />
                        </a>
                    </div>
                ))}
            </Slider>
        </div>
    )
}
