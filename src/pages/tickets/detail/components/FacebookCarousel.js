// @flow
import React from 'react'

import {
    Card,
    CardImg,
    CardBlock,
    CardTitle,
    CardSubtitle,
    Button,
    ButtonGroup
} from 'reactstrap'
import Slider from 'react-slick'

import css from './FacebookCarousel.less'

type Props = {
    data: Array<{
        payload?: {
            elements?: Array<{
                title: string,
                subtitle: string,
                image_url: string,
                buttons?: Array<{
                    type: string,
                    title: string,
                    url: string
                }>
            }>
        }
    }>
}

export default class FacebookCarousel extends React.Component<Props> {
    render() {
        const {data} = this.props

        return (
            <div className={css.carousel}>
                {
                    data.map((template, idx) => {
                        return (
                            <Slider
                                key={idx}
                                arrows
                                slidesToShow="3"
                                infinite={false}
                                responsive={[
                                    {
                                        breakpoint: 769,
                                        settings: {slidesToShow: 1}
                                    },
                                    {
                                        breakpoint: 1441,
                                        settings: {slidesToShow: 2}
                                    }
                                ]}
                            >
                                {
                                    template.payload && template.payload.elements &&
                                    template.payload.elements.map((element, idx) => {
                                        return (
                                            <div
                                                key={idx}
                                                className={css.carouselCardContainer}
                                            >
                                                <Card
                                                    className={css.carouselCard}
                                                >
                                                    <CardImg
                                                        top
                                                        width="100%"
                                                        src={element.image_url}
                                                        className={css.carouselImage}
                                                    />
                                                    <CardBlock>
                                                        <CardTitle>{element.title}</CardTitle>
                                                        <CardSubtitle>{element.subtitle}</CardSubtitle>
                                                    </CardBlock>
                                                    <ButtonGroup
                                                        vertical
                                                        className={css.buttons}
                                                    >
                                                    {
                                                        element.buttons && element.buttons.map((button, idx) => {
                                                            if (button.type === 'web_url') {
                                                                return (
                                                                    <Button
                                                                        key={idx}
                                                                        tag="a"
                                                                        href={button.url}
                                                                        target="_blank"
                                                                    >
                                                                        {button.title}
                                                                    </Button>
                                                                )
                                                            } else if (button.type === 'element_share') {
                                                                return (
                                                                    <Button
                                                                        key={idx}
                                                                        disabled
                                                                    >
                                                                        Share
                                                                    </Button>
                                                                )
                                                            }
                                                        })
                                                    }
                                                    </ButtonGroup>
                                                </Card>
                                            </div>
                                        )
                                    })
                                }
                            </Slider>
                        )
                    })
                }
            </div>
        )
    }
}
