import {Col, Container, Row} from 'reactstrap'
import classnames from 'classnames'
import Lightbox from 'react-images'
import React, {ReactNode, useState} from 'react'

import {paywallConfigs} from '../../../../config/paywalls'
import {AccountFeature} from '../../../../state/currentAccount/types'

import css from './CirclePaywall.less'

type Props = {
    feature: AccountFeature
    ctaButton: ReactNode
    modale?: ReactNode
    badge?: ReactNode
    pageHeader?: JSX.Element
}

const CirclePaywall = ({
    feature,
    ctaButton,
    pageHeader,
    badge,
    modale,
}: Props) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const config = paywallConfigs[feature]

    return (
        <div className="full-width">
            {config && (
                <>
                    {pageHeader &&
                        React.cloneElement(pageHeader, {
                            className: css.pageHeader,
                        })}
                    <div className={css.paywallWrapper}>
                        <div className={css.coloredCircle} />
                        <Container fluid className={'page-container'}>
                            <Row>
                                <Col xs={12} xl={6} className={css.preview}>
                                    {config?.preview && (
                                        <img
                                            src={config.preview}
                                            alt="Feature preview"
                                            className={classnames(
                                                'img-fluid',
                                                css.previewImage
                                            )}
                                            onClick={() =>
                                                setIsLightboxOpen(true)
                                            }
                                        />
                                    )}
                                </Col>
                                <Col className={css.info} xs={12} xl={6}>
                                    <div className={css.badgeWrapper}>
                                        {badge}
                                    </div>
                                    <h1 className={css.header}>
                                        {config?.header}
                                    </h1>
                                    <p className={css.infoText}>
                                        {config?.description}
                                    </p>
                                    <div className={css.ctaButtonWrapper}>
                                        {ctaButton}
                                    </div>
                                </Col>
                            </Row>
                            {config?.preview && (
                                <Lightbox
                                    images={[{src: config.preview}]}
                                    isOpen={isLightboxOpen}
                                    onClose={() => setIsLightboxOpen(false)}
                                    onClickImage={() =>
                                        setIsLightboxOpen(false)
                                    }
                                    backdropClosesModal
                                />
                            )}
                        </Container>
                    </div>
                    {modale}
                </>
            )}
        </div>
    )
}

export default CirclePaywall
