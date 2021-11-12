import {Badge, Col, Container, Row} from 'reactstrap'
import classnames from 'classnames'
import Lightbox from 'react-images'
import React, {useState} from 'react'
import {useSelector} from 'react-redux'

import {paywallConfigs as defaultPaywallConfigs} from '../../../../config/paywalls'
import UpgradeButton from '../UpgradeButton'
import {AccountFeature} from '../../../../state/currentAccount/types'
import {RootState} from '../../../../state/types'
import {
    hasLegacyPlan,
    getCurrentPlan,
} from '../../../../state/billing/selectors'
import {BillingState} from '../../../../state/billing/types'
import {Plan} from '../../../../models/billing/types'
import {toJS} from '../../../../utils'
import {getCheapestPlanNameForFeature} from '../../../../utils/paywalls'

import PageHeader from '../PageHeader'

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
    const isLegacyPlan = useSelector(hasLegacyPlan)
    const currentPlan = useSelector(getCurrentPlan)
    const plans: Record<string, Plan> | undefined = toJS(
        billingState.get('plans')
    )
    const shouldKeepPlan =
        currentPlan.get('custom') ||
        (isLegacyPlan &&
            plans &&
            !!Object.values(plans).find(
                (plan) =>
                    plan.name.split(' ')[0] ===
                        (currentPlan.get('name') as string | undefined)?.split(
                            ' '
                        )[0] && plan.features[feature]?.enabled
            ))
    const requiredPlanName = currentPlan.get('custom')
        ? 'Enterprise'
        : shouldKeepPlan
        ? (currentPlan.get('name') as string)?.split(' ')[0]
        : getCheapestPlanNameForFeature(feature, plans || {})
    const config = paywallConfigs[feature]

    return (
        <div className={classnames('full-width', css.pageWrapper)}>
            {config && requiredPlanName && (
                <>
                    {config.pageHeader && (
                        <PageHeader
                            title={config.pageHeader}
                            className={css.pageHeader}
                        />
                    )}
                    <Container
                        fluid
                        className={classnames('page-container', css.page)}
                    >
                        <div className={css.paywallContainer}>
                            <Row className="align-items-center">
                                <Col
                                    xs={12}
                                    lg={6}
                                    xl={6}
                                    className={classnames(
                                        'mt-5',
                                        'mt-lg-0',
                                        'mb-5',
                                        'mb-lg-0',
                                        'pl-lg-4',
                                        'pt-5',
                                        'pt-lg-0',
                                        css.preview,
                                        {
                                            [css.advanced]:
                                                requiredPlanName === 'Advanced',
                                        },
                                        {
                                            [css.enterprise]:
                                                requiredPlanName ===
                                                'Enterprise',
                                        }
                                    )}
                                >
                                    {config.preview && (
                                        <div>
                                            <img
                                                src={config.preview}
                                                alt="Feature preview"
                                                className="img-fluid"
                                                onClick={() =>
                                                    setIsLightboxOpen(true)
                                                }
                                            />
                                        </div>
                                    )}
                                </Col>
                                <Col xs={12} lg={5} xl={5} className="pl-lg-5">
                                    <div className={css.content}>
                                        <div className="flex align-items-center">
                                            {shouldKeepPlan && (
                                                <>
                                                    <Badge
                                                        className={css.badge}
                                                        color="danger"
                                                    >
                                                        <i className="material-icons mr-1">
                                                            warning
                                                        </i>
                                                        Legacy plan
                                                    </Badge>
                                                    <i
                                                        className={classnames(
                                                            'material-icons',
                                                            css.upgradeChevron
                                                        )}
                                                    >
                                                        chevron_right
                                                    </i>
                                                </>
                                            )}
                                            <Badge
                                                className={classnames(
                                                    css.badge,
                                                    {
                                                        [css.pro]:
                                                            requiredPlanName ===
                                                            'Pro',
                                                    },
                                                    {
                                                        [css.advanced]:
                                                            requiredPlanName ===
                                                            'Advanced',
                                                    },
                                                    {
                                                        [css.enterprise]:
                                                            requiredPlanName ===
                                                            'Enterprise',
                                                    }
                                                )}
                                                color="primary"
                                            >
                                                {`${requiredPlanName} Plan`}
                                            </Badge>
                                        </div>
                                        <h1 className={css.contentTitle}>
                                            {config.header}
                                        </h1>
                                        <div className={css.description}>
                                            <p>{config.description}</p>
                                        </div>
                                        {config.testimonial && (
                                            <div className={css.testimonial}>
                                                <p
                                                    className={
                                                        css.testimonialText
                                                    }
                                                >
                                                    {config.testimonial.text}
                                                </p>
                                                <div
                                                    className={classnames(
                                                        'd-flex',
                                                        'align-items-center',
                                                        css.author
                                                    )}
                                                >
                                                    <img
                                                        src={
                                                            config.testimonial
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
                                                            className={classnames(
                                                                css.authorName,
                                                                'mb-1'
                                                            )}
                                                        >
                                                            <strong>
                                                                {
                                                                    config
                                                                        .testimonial
                                                                        .author
                                                                        .name
                                                                }
                                                            </strong>
                                                        </p>
                                                        <p
                                                            className={
                                                                css.authorDetails
                                                            }
                                                        >
                                                            {
                                                                config
                                                                    .testimonial
                                                                    .author
                                                                    .position
                                                            }{' '}
                                                            at{' '}
                                                            <a
                                                                href={
                                                                    config
                                                                        .testimonial
                                                                        .author
                                                                        .company
                                                                        .href
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {
                                                                    config
                                                                        .testimonial
                                                                        .author
                                                                        .company
                                                                        .name
                                                                }
                                                            </a>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <UpgradeButton
                                            className={css.upgradeButton}
                                            label={
                                                shouldKeepPlan
                                                    ? `Upgrade to New ${requiredPlanName}`
                                                    : `Upgrade to ${requiredPlanName}`
                                            }
                                            state={{
                                                openedPlanModal: requiredPlanName,
                                            }}
                                        />
                                    </div>
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
                </>
            )}
        </div>
    )
}

export default Paywall
