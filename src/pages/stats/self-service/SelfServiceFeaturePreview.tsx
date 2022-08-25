import React from 'react'
import {Col, Row} from 'reactstrap'
import Button from '../../common/components/button/Button'
import history from '../../history'
import css from './SelfServiceStatsPage.less'

type Props = {
    title: string
    description: string
    buttonText: string
    buttonRedirectUrl: string
    imageUrl: string
    imageAltText: string
}

export const SelfServiceFeaturePreview = ({
    title,
    description,
    buttonText,
    buttonRedirectUrl,
    imageUrl,
    imageAltText,
}: Props): JSX.Element => {
    return (
        <>
            <Row className="align-items-center">
                <div className="float-right">
                    <img
                        src={imageUrl}
                        alt={imageAltText}
                        className="img-fluid float-right"
                    />
                </div>
                <Col>
                    <div className={css.title}>{title}</div>
                    <div className={css.description}>{description}</div>
                    <Button onClick={() => history.push(buttonRedirectUrl)}>
                        {buttonText}
                    </Button>
                </Col>
            </Row>
        </>
    )
}
