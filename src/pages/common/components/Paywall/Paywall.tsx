import {Col, Container, Row} from 'reactstrap'
import classnames from 'classnames'
import Lightbox from 'react-images'
import React, {useState} from 'react'
import {useSelector} from 'react-redux'

import {paywallConfigs as defaultPaywallConfigs} from '../../../../config/paywalls'
import UpgradeButton from '../UpgradeButton'
import {AccountFeature} from '../../../../state/currentAccount/types'
import {RootState} from '../../../../state/types'
import {BillingState} from '../../../../state/billing/types'
import {Plan} from '../../../../models/billing/types'
import {toJS} from '../../../../utils'
import {getCheapestPlanNameForFeature} from '../../../../utils/paywalls'

import css from './Paywall.less'

type Props = {
    feature: AccountFeature
    paywallConfigs?: typeof defaultPaywallConfigs
}

const Paywall = ({feature, paywallConfigs = defaultPaywallConfigs}: Props) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const billingState = useSelector<RootState, BillingState>(
        (state) => state.billing
    )
    const plans: Record<string, Plan> | undefined = toJS(
        billingState.get('plans')
    )
    const requiredPlanName = getCheapestPlanNameForFeature(feature, plans || {})
    const config = paywallConfigs[feature]
    return (
        <div className="full-width">
            {config && requiredPlanName && (
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
                                <h1 className={css.header}>{config.header}</h1>
                                <p className={css.infoText}>
                                    {config.description}
                                </p>
                                <UpgradeButton
                                    className="mt-3 mb-5 d-inline-block"
                                    label={`Upgrade to ${requiredPlanName}`}
                                    state={{
                                        openedPlanPopover: requiredPlanName,
                                    }}
                                />
                                {config.testimonial && (
                                    <>
                                        <p className={css.testimonialText}>
                                            {config.testimonial.text}
                                        </p>
                                        <div className="d-flex mt-4">
                                            <img
                                                src={
                                                    config.testimonial.author
                                                        .avatar
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
                                                            config.testimonial
                                                                .author.name
                                                        }
                                                    </strong>
                                                </p>
                                                <p
                                                    className={
                                                        css.testimonialDetails
                                                    }
                                                >
                                                    {
                                                        config.testimonial
                                                            .author.position
                                                    }{' '}
                                                    at{' '}
                                                    <a
                                                        href={
                                                            config.testimonial
                                                                .author.company
                                                                .href
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={
                                                            css.companyLink
                                                        }
                                                    >
                                                        {
                                                            config.testimonial
                                                                .author.company
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
                                {config.preview && (
                                    <img
                                        src={config.preview}
                                        alt="Feature preview"
                                        className={classnames(
                                            'img-fluid',
                                            css.previewImage
                                        )}
                                        onClick={() => setIsLightboxOpen(true)}
                                    />
                                )}
                            </Col>
                        </Row>
                    </div>
                    {config.preview && (
                        <Lightbox
                            images={[{src: config.preview}]}
                            isOpen={isLightboxOpen}
                            onClose={() => setIsLightboxOpen(false)}
                            onClickImage={() => setIsLightboxOpen(false)}
                            backdropClosesModal
                        />
                    )}
                </Container>
            )}
        </div>
    )
}

export default Paywall
