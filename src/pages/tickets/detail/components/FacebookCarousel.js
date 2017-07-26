import React, {PropTypes} from 'react'

import {
    Card,
    CardImg,
    CardBlock,
    CardTitle,
    CardSubtitle,
    Button,
    ButtonGroup
} from 'reactstrap'

import css from './FacebookCarousel.less'


export default class FacebookCarousel extends React.Component {
    static propTypes = {
        data: PropTypes.array.isRequired
    }

    render() {
        const {data} = this.props

        return (
            <div>
                {
                    data.map((template, idx) => {
                        return (
                            <div key={idx}>
                                {
                                    template.payload.elements.map((element, idx) => {
                                        return (
                                            <Card
                                                key={idx}
                                                className={css.carouselCard}
                                            >
                                                <CardImg
                                                    top
                                                    width="100%"
                                                    src={element.image_url}
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
                                                    element.buttons.map((button, idx) => {
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
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}
