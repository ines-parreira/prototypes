import React from 'react'
import _get from 'lodash/get'
import {Card, CardImg, CardBody, CardTitle, CardSubtitle} from 'reactstrap'
import Slider from 'react-slick'

import Button from 'pages/common/components/button/Button'
import Group from 'pages/common/components/layout/Group'
import {FacebookCarouselTemplate} from '../../../../models/ticket/types'

import css from './FacebookCarousel.less'

type Props = {
    data: FacebookCarouselTemplate[]
}

const FacebookCarousel = ({data = []}: Props) => (
    <div className={css.carousel}>
        {data.map((template, idx) => {
            const templateType =
                _get(template, ['payload', 'template_type']) || ''
            const elements = _get(template, ['payload', 'elements']) || []

            // only render generic templates with elements
            if (templateType !== 'generic' || !elements.length) {
                return null
            }

            return (
                <Slider
                    key={idx}
                    arrows
                    slidesToShow={3}
                    infinite={false}
                    responsive={[
                        {
                            breakpoint: 769,
                            settings: {slidesToShow: 1},
                        },
                        {
                            breakpoint: 1441,
                            settings: {slidesToShow: 2},
                        },
                    ]}
                >
                    {elements.map((element, idx) => {
                        const buttons = element.buttons || []

                        return (
                            <div
                                key={idx}
                                className={css.carouselCardContainer}
                            >
                                <Card className={css.carouselCard}>
                                    <CardImg
                                        top
                                        width="100%"
                                        src={element.image_url}
                                        className={css.carouselImage}
                                    />
                                    <CardBody>
                                        <CardTitle>{element.title}</CardTitle>
                                        <CardSubtitle>
                                            {element.subtitle}
                                        </CardSubtitle>
                                    </CardBody>
                                    <Group
                                        className={css.buttons}
                                        orientation="vertical"
                                    >
                                        {buttons.map((button, idx) => {
                                            if (button.type === 'web_url') {
                                                return (
                                                    <Button
                                                        key={idx}
                                                        intent="secondary"
                                                        onClick={() => {
                                                            window
                                                                .open(
                                                                    button.url,
                                                                    '_blank'
                                                                )
                                                                ?.focus()
                                                        }}
                                                        role="link"
                                                    >
                                                        {button.title}
                                                    </Button>
                                                )
                                            } else if (
                                                button.type === 'element_share'
                                            ) {
                                                return (
                                                    <Button
                                                        key={idx}
                                                        isDisabled
                                                    >
                                                        Share
                                                    </Button>
                                                )
                                            }
                                        })}
                                    </Group>
                                </Card>
                            </div>
                        )
                    })}
                </Slider>
            )
        })}
    </div>
)

export default FacebookCarousel
