import React, {PropTypes} from 'react'
import Slider from 'react-slick'
import css from './Carousel.less'


export default class Carousel extends React.Component {
    static propTypes = {
        imagesUrl: PropTypes.array.isRequired,

        slidesToShow: PropTypes.number.isRequired,
        arrows: PropTypes.bool.isRequired,
        autoplay: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        slidesToShow: 2,
        arrows: false,
        autoplay: true
    }

    render() {
        const {imagesUrl, slidesToShow, arrows, autoplay} = this.props

        return (
            <div className={css.carouselContainer}>
                <Slider
                    dots
                    slidesToShow={slidesToShow}
                    arrows={arrows}
                    autoplay={autoplay}
                    autoplaySpeed={3000}
                >
                    {
                        imagesUrl.map((url, idx) => (
                            <div key={idx} className={css.carouselContent}>
                                <a href={url} target="_blank">
                                    <img src={url}/>
                                </a>
                            </div>
                        ))
                    }
                </Slider>
            </div>
        )
    }
}
