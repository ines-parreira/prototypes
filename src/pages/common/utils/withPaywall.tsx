import React, {ComponentProps, ComponentType, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Col, Container, Row} from 'reactstrap'
import Lightbox from 'react-images'
import classnames from 'classnames'

import {RootState} from '../../../state/types'
import {AccountFeatures} from '../../../state/currentAccount/types'
import {paywallConfigs} from '../../../config/paywalls'
import UpgradeButton from '../components/UpgradeButton'

import css from './withPaywall.less'

export const withPaywall = (
    feature: typeof AccountFeatures[keyof typeof AccountFeatures]
) => {
    const connector = connect((state: RootState) => {
        const features = state.currentAccount.get('features') as Map<any, any>
        const hasFeature: boolean | undefined = features.get(feature)
        const paywallData = paywallConfigs[feature]
        return {hasFeature, paywallData}
    })

    return (Component: ComponentType<Record<string, unknown>>) => {
        const PaywallHOC = ({
            hasFeature,
            paywallData,
            ...ownProps
        }: ConnectedProps<typeof connector> &
            ComponentProps<typeof Component>) => {
            const [isLightboxOpen, setLightboxState] = useState<boolean>(false)

            if (hasFeature) {
                return <Component {...ownProps} />
            }
            return (
                <div className="full-width">
                    {paywallData && (
                        <Container
                            fluid
                            className={classnames(
                                'page-container',
                                'pl-lg-5',
                                css.page
                            )}
                        >
                            <div className={classnames(css.paywallContainer)}>
                                <Row>
                                    <Col xs={12} lg={4} xl={5}>
                                        <h1 className={css.header}>
                                            {paywallData.header}
                                        </h1>
                                        <p className={css.infoText}>
                                            {paywallData.description}
                                        </p>
                                        <UpgradeButton
                                            className="mt-3 mb-5"
                                            label={`Upgrade to ${paywallData.upgradeType}`}
                                        />
                                        {paywallData.testimonial && (
                                            <>
                                                <p
                                                    className={
                                                        css.testimonialText
                                                    }
                                                >
                                                    {
                                                        paywallData.testimonial
                                                            .text
                                                    }
                                                </p>
                                                <div className="d-flex mt-4">
                                                    <img
                                                        src={
                                                            paywallData
                                                                .testimonial
                                                                .author.avatar
                                                        }
                                                        className={classnames(
                                                            'mr-3',
                                                            css.avatar
                                                        )}
                                                        alt="avatar"
                                                    />
                                                    <div>
                                                        <p
                                                            className={
                                                                css.testimonialDetails
                                                            }
                                                        >
                                                            <strong>
                                                                {
                                                                    paywallData
                                                                        .testimonial
                                                                        .author
                                                                        .name
                                                                }
                                                            </strong>
                                                        </p>
                                                        <p
                                                            className={
                                                                css.testimonialDetails
                                                            }
                                                        >
                                                            {
                                                                paywallData
                                                                    .testimonial
                                                                    .author
                                                                    .position
                                                            }{' '}
                                                            at{' '}
                                                            <a
                                                                href={
                                                                    paywallData
                                                                        .testimonial
                                                                        .author
                                                                        .company
                                                                        .href
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={
                                                                    css.companyLink
                                                                }
                                                            >
                                                                {
                                                                    paywallData
                                                                        .testimonial
                                                                        .author
                                                                        .company
                                                                        .name
                                                                }
                                                            </a>
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </Col>
                                    <Col
                                        xs={12}
                                        lg={8}
                                        xl={7}
                                        className={classnames(
                                            'mt-5',
                                            'mt-lg-0',
                                            'pl-lg-5',
                                            css.preview
                                        )}
                                    >
                                        {paywallData.preview && (
                                            <img
                                                src={paywallData.preview}
                                                alt="auto-assignment"
                                                className={classnames(
                                                    'img-fluid',
                                                    css.previewImage
                                                )}
                                                onClick={() =>
                                                    setLightboxState(true)
                                                }
                                            />
                                        )}
                                    </Col>
                                </Row>
                            </div>
                            {paywallData.preview && (
                                <Lightbox
                                    images={[{src: paywallData.preview}]}
                                    isOpen={isLightboxOpen}
                                    onClose={() => setLightboxState(false)}
                                    onClickImage={() => setLightboxState(false)}
                                    backdropClosesModal
                                />
                            )}
                        </Container>
                    )}
                </div>
            )
        }
        return connector(PaywallHOC)
    }
}

export default withPaywall
