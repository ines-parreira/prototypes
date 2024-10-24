import classNamesBind from 'classnames/bind'
import React from 'react'
import {Col, Container, Row} from 'reactstrap'

import {TicketMessage} from 'models/ticket/types'
import ProductEmbeddedCard from 'pages/common/components/ProductEmbeddedCard/ProductEmbeddedCard'
import TicketMessageEmbeddedCard from 'pages/common/components/TicketMessageEmbeddedCard/TicketMessageEmbeddedCard'
import {mapQuotedTweetTicketMessageToEmbeddedCard} from 'pages/common/components/TicketMessageEmbeddedCard/utils'
import FacebookCarousel from 'pages/tickets/detail/components/FacebookCarousel'

import css from './Body.less'
import Content from './Content'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage
    className?: string
    hasError?: boolean
}

const Body = (props: Props) => {
    const {message, className} = props

    return (
        <div
            className={classNames(css.component, className, {
                hasError: props.hasError,
            })}
        >
            <Content
                html={message.body_html}
                text={message.body_text}
                messageId={message.id}
                strippedHtml={message.stripped_html}
                strippedText={message.stripped_text}
                meta={message.meta}
            />

            {message.meta && message.meta.facebook_carousel && (
                <FacebookCarousel data={message.meta.facebook_carousel} />
            )}

            {message.meta && message.meta.quoted_tweet && (
                <Container className={classNames(' px-0', 'ml-n2')}>
                    <Row className="m-0">
                        <Col md="9" className="p-0">
                            <TicketMessageEmbeddedCard
                                {...mapQuotedTweetTicketMessageToEmbeddedCard(
                                    message
                                )}
                            />
                        </Col>
                    </Row>
                </Container>
            )}
            {message.meta && message.meta.product && (
                <ProductEmbeddedCard product={message.meta.product} />
            )}
        </div>
    )
}

export default Body
