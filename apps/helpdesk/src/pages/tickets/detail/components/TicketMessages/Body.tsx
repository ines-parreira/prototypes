import classNamesBind from 'classnames/bind'
import { noop } from 'lodash'
import { Col, Container, Row } from 'reactstrap'

import { TicketMessage } from 'models/ticket/types'
import ProductEmbeddedCard from 'pages/common/components/ProductEmbeddedCard/ProductEmbeddedCard'
import TicketMessageEmbeddedCard from 'pages/common/components/TicketMessageEmbeddedCard/TicketMessageEmbeddedCard'
import { mapQuotedTweetTicketMessageToEmbeddedCard } from 'pages/common/components/TicketMessageEmbeddedCard/utils'
import FacebookCarousel from 'pages/tickets/detail/components/FacebookCarousel'

import Content from './Content'
import { useSmartFollowUps } from './hooks/useSmartFollowUps'
import SmartFollowUps from './SmartFollowUps'

import css from './Body.less'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage
    className?: string
    hasError?: boolean
    messagePosition?: number
    toggleQuote?: (messageId: number | undefined) => void
    isMessageExpanded?: boolean
}

const Body = ({
    toggleQuote = noop,
    isMessageExpanded = false,
    ...props
}: Props) => {
    const { message, className, messagePosition = 1 } = props

    const {
        smartFollowUps,
        selectedSmartFollowUpIndex,
        shouldRenderMessageContent,
        shouldRenderSmartFollowUps,
    } = useSmartFollowUps(message.meta)

    return (
        <div
            className={classNames(css.component, className, {
                hasError: props.hasError,
            })}
        >
            {shouldRenderMessageContent && (
                <Content
                    html={message.body_html}
                    text={message.body_text}
                    messageId={message.id}
                    strippedHtml={message.stripped_html}
                    strippedText={message.stripped_text}
                    meta={message.meta}
                    messagePosition={messagePosition}
                    toggleQuote={toggleQuote}
                    isMessageExpanded={isMessageExpanded}
                />
            )}

            {shouldRenderSmartFollowUps && (
                <SmartFollowUps
                    smartFollowUps={smartFollowUps}
                    selectedSmartFollowUpIndex={selectedSmartFollowUpIndex}
                />
            )}

            {message.meta && message.meta.facebook_carousel && (
                <FacebookCarousel data={message.meta.facebook_carousel} />
            )}

            {message.meta && message.meta.quoted_tweet && (
                <Container className={classNames(' px-0', 'ml-n2')}>
                    <Row className="m-0">
                        <Col md="9" className="p-0">
                            <TicketMessageEmbeddedCard
                                {...mapQuotedTweetTicketMessageToEmbeddedCard(
                                    message,
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
