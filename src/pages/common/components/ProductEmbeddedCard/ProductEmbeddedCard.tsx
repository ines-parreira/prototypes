import React, {useState} from 'react'
import {Container, Collapse, Badge, Row, Col} from 'reactstrap'

import ReactStars from 'react-rating-stars-component'

import {ProductDetails} from '../../../../models/ticket/types'
import {getIconFromUrl} from '../../../../state/integrations/helpers'

import GenericCard from '../GenericCard/GenericCard'

import {starRatingProps} from '../infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/yotpo/Reviews'

import css from './ProductEmbeddedCard.less'

type Props = {
    product: ProductDetails
}

export default function ProductEmbeddedCard(props: Props) {
    const {product} = props
    const [isOpen, setIsOpen] = useState(false)

    const starRatings = starRatingProps(product.average_score)

    const toggle = () => setIsOpen(!isOpen)
    return (
        <GenericCard>
            <Container className={css.cardContainer}>
                <Row>
                    <Col>
                        <img
                            alt="product"
                            className={css.productImage}
                            src={
                                product.images?.length
                                    ? product.images[0].square
                                    : getIconFromUrl(
                                          'integrations/shopify-placeholder.png'
                                      )
                            }
                        />
                    </Col>
                    <Col>
                        <Row>
                            <strong>{product.name}</strong>
                        </Row>
                        <Row>
                            <div>
                                <span className={css.starRatingWrapper}>
                                    <ReactStars {...starRatings} />
                                </span>
                                <span className={css.totalReviews}>
                                    ({product.total_reviews})
                                </span>
                            </div>
                        </Row>
                    </Col>
                    <Col className={css.chevronButton}>
                        <i className="material-icons" onClick={toggle}>
                            unfold_more
                        </i>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Collapse isOpen={isOpen}>
                            <table>
                                <tbody>
                                    <tr>
                                        <td className={css.cardDetail}>
                                            Description:
                                        </td>
                                        <th>{product.description}</th>
                                    </tr>
                                    <tr>
                                        <td className={css.cardDetail}>
                                            Product page:
                                        </td>
                                        <th>
                                            <a
                                                href={product.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {product.url}
                                            </a>
                                        </th>
                                    </tr>
                                    <tr>
                                        <td className={css.cardDetail}>
                                            Category:
                                        </td>
                                        <th>
                                            <Badge>
                                                {product.category.name}
                                            </Badge>
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </Collapse>
                    </Col>
                </Row>
            </Container>
        </GenericCard>
    )
}
