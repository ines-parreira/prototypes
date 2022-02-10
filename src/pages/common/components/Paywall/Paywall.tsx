import {Badge, Col, Container, Row} from 'reactstrap'
import classnames from 'classnames'
import Lightbox from 'react-images'
import React, {isValidElement, ReactNode, useState} from 'react'

import UpgradeButton from '../UpgradeButton'
import PageHeader from '../PageHeader'

import {PaywallConfig} from '../../../../config/paywalls'
import css from './Paywall.less'

export enum PaywallTheme {
    Default = 'Default',
    Basic = 'Basic',
    Pro = 'Pro',
    Advanced = 'Advanced',
    Enterprise = 'Enterprise',
}

export enum UpgradeType {
    Plan = 'Plan',
    AddOn = 'Add-on',
}

type Props = {
    pageHeader?: ReactNode
    paywallTheme?: PaywallTheme
    previewImage: string
    renderFilterShadow?: boolean
    shouldKeepPlan?: boolean
    requiredUpgrade: string
    upgradeType?: UpgradeType
    header: string
    description: ReactNode
    testimonial?: PaywallConfig['testimonial']
    showUpgradeCta?: boolean
    customCta?: ReactNode
    modal?: ReactNode
}

const Paywall = ({
    pageHeader,
    paywallTheme = PaywallTheme.Default,
    previewImage,
    renderFilterShadow,
    shouldKeepPlan,
    requiredUpgrade,
    upgradeType = UpgradeType.Plan,
    header,
    description,
    testimonial,
    showUpgradeCta,
    customCta,
    modal,
}: Props) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    return (
        <div className={classnames('full-width', css.pageWrapper)}>
            {pageHeader &&
                (isValidElement(pageHeader) ? (
                    pageHeader
                ) : (
                    <PageHeader title={pageHeader} />
                ))}
            <Container fluid className={classnames(css.page)}>
                <div className={css.paywallContainer}>
                    <Row className="align-items-center mx-0">
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
                                css[paywallTheme?.toLowerCase()]
                            )}
                        >
                            {previewImage && (
                                <div
                                    className={classnames(
                                        renderFilterShadow && css.filterShadow
                                    )}
                                >
                                    <img
                                        src={previewImage}
                                        alt="Feature preview"
                                        className="img-fluid"
                                        onClick={() => setIsLightboxOpen(true)}
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
                                        className={classnames(css.badge, [
                                            css[paywallTheme?.toLowerCase()],
                                        ])}
                                        color="primary"
                                    >
                                        {`${requiredUpgrade} ${upgradeType}`}
                                    </Badge>
                                </div>
                                <h1 className={css.contentTitle}>{header}</h1>
                                <div className={css.description}>
                                    <p>{description}</p>
                                </div>
                                {testimonial && (
                                    <div className={css.testimonial}>
                                        <p className={css.testimonialText}>
                                            {testimonial.text}
                                        </p>
                                        <div
                                            className={classnames(
                                                'd-flex',
                                                'align-items-center',
                                                css.author
                                            )}
                                        >
                                            <img
                                                src={testimonial.author.avatar}
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
                                                            testimonial.author
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
                                                        testimonial.author
                                                            .position
                                                    }{' '}
                                                    at{' '}
                                                    <a
                                                        href={
                                                            testimonial.author
                                                                .company.href
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {
                                                            testimonial.author
                                                                .company.name
                                                        }
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showUpgradeCta && !customCta && (
                                    <UpgradeButton
                                        className={css.upgradeButton}
                                        label={
                                            shouldKeepPlan
                                                ? `Upgrade to New ${requiredUpgrade}`
                                                : `Upgrade to ${requiredUpgrade}`
                                        }
                                        state={{
                                            openedPlanModal: requiredUpgrade,
                                        }}
                                    />
                                )}
                                {customCta && (
                                    <div className={css.upgradeButton}>
                                        {customCta}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>
                {previewImage && (
                    <Lightbox
                        images={[{src: previewImage}]}
                        isOpen={isLightboxOpen}
                        onClose={() => setIsLightboxOpen(false)}
                        onClickImage={() => setIsLightboxOpen(false)}
                        backdropClosesModal
                    />
                )}
                {modal}
            </Container>
        </div>
    )
}

export default Paywall
