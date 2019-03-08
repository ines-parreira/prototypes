// @flow
import React from 'react'
import _get from 'lodash/get'

import {
    Card,
    CardImg,
    CardBody,
    CardTitle,
    CardSubtitle,
    Button,
    ButtonGroup
} from 'reactstrap'
import Slider from 'react-slick'

import type {FacebookCarouselTemplate} from '../../../../models/ticket/types'

import css from './FacebookCarousel.less'

type Props = {
    data: FacebookCarouselTemplate[]
}

export default class FacebookCarousel extends React.Component<Props> {
    static defaultProps = {
        data: []
    }

    render() {
        const {data} = this.props

        return (
            <div className={css.carousel}>
                {
                    data.map((template, idx) => {
                        const templateType = _get(template, ['payload', 'template_type']) || ''
                        const elements = _get(template, ['payload', 'elements']) || []

                        // only render generic templates with elements
                        if (templateType !== 'generic' || !elements.length) {
                            return null
                        }

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
                                    elements.map((element, idx) => {
                                        const buttons = element.buttons || []

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
                                                    <CardBody>
                                                        <CardTitle>{element.title}</CardTitle>
                                                        <CardSubtitle>{element.subtitle}</CardSubtitle>
                                                    </CardBody>
                                                    <ButtonGroup
                                                        vertical
                                                        className={css.buttons}
                                                    >
                                                    {
                                                        buttons.map((button, idx) => {
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
