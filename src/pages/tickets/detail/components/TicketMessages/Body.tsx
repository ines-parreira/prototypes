import React from 'react'
import {Col, Container, Row} from 'reactstrap'

import classNamesBind from 'classnames/bind'

import FacebookCarousel from '../FacebookCarousel'
import {TicketMessage} from '../../../../../models/ticket/types'

import TicketMessageEmbeddedCard from '../../../../common/components/TicketMessageEmbeddedCard/TicketMessageEmbeddedCard'
import ProductEmbeddedCard from '../../../../common/components/ProductEmbeddedCard/ProductEmbeddedCard'
import {mapQuotedTweetTicketMessageToEmbeddedCard} from '../../../../common/components/TicketMessageEmbeddedCard/utils'

import Content from './Content'
import css from './Body.less'

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
