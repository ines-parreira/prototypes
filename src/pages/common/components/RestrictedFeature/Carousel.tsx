import React, {Component, MouseEvent} from 'react'
import Slider from 'react-slick'

import css from './Carousel.less'

type Props = {
    imagesUrl: string[]
    slidesToShow: number
    arrows: boolean
    autoplay: boolean
    onImageClick?: (img: {url: string; index: number; e: MouseEvent}) => void
}

export default class Carousel extends Component<Props> {
    static defaultProps: Pick<Props, 'slidesToShow' | 'arrows' | 'autoplay'> = {
        slidesToShow: 2,
        arrows: false,
        autoplay: true,
    }

    render() {
        const {imagesUrl, slidesToShow, arrows, autoplay, onImageClick} =
            this.props

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
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
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
}
