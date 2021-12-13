import {Col, Container, Row, Badge} from 'reactstrap'
import classnames from 'classnames'
import Lightbox from 'react-images'
import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Map} from 'immutable'

import helpCenterImagePreview from 'assets/img/paywalls/screens/helpcenter-steve-madden.png'

import UpgradeButton from '../../../../common/components/UpgradeButton'
import PageHeader from '../../../../common/components/PageHeader'
import {getCurrentPlan, getPlans} from '../../../../../state/billing/selectors'
import {openChat} from '../../../../../utils'
import {PlanInterval} from '../../../../../models/billing/types'
import {
    convertLegacyPlanNameToPublicPlanName,
    PlanName,
} from '../../../../../utils/paywalls'

import css from './HelpCenterPaywall.less'
import HelpCenterChangePlanModal from './HelpCenterChangePlanModal'

const HelpCenterPaywall = (): JSX.Element => {
    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(false)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const plans = useSelector(getPlans)
    const currentPlan = useSelector(getCurrentPlan)
    const planName = currentPlan.get('name') as string
    const currentPlanName = convertLegacyPlanNameToPublicPlanName(planName)

    const displayContactUsButton = currentPlanName === PlanName.Enterprise
    const isEnterprisePlan = currentPlan.get('custom', false) as boolean
    const availablePlans = plans.filter(
        (plan: Map<any, any>) =>
            (plan.get('interval') as string) ===
                (currentPlan.get('interval') || PlanInterval.Month) &&
            (plan.get('public') as boolean) &&
            !(plan.get('custom') as boolean)
    ) as Map<any, any>
    const suitablePlanWithoutAutomationAddOn: Map<any, any> =
        !isEnterprisePlan &&
        availablePlans.find(
            (plan: Map<any, any>) =>
                plan.get('name') === currentPlanName &&
                plan.get('automation_addon_included', false) === false
        )

    return (
        <div className="full-width">
            <PageHeader title="Help Center" />
            <div className={css.paywallWrapper}>
                <div
                    className={classnames(
                        css.coloredCircle,
                        css[currentPlanName.toLowerCase()]
                    )}
                />
                <Container fluid className="page-container">
                    <Row>
                        <Col xs={12} xl={6} className={css.preview}>
                            <img
                                src={helpCenterImagePreview}
                                alt="Feature preview"
                                className={classnames(
                                    'img-fluid',
                                    css.previewImage
                                )}
                                onClick={() => setIsLightboxOpen(true)}
                            />
                        </Col>
                        <Col className={css.info} xs={12} xl={6}>
                            <div className={css.badgeContainer}>
                                <Badge
                                    className={classnames(
                                        css.badge,
                                        css.legacy
                                    )}
                                >
                                    Legacy Plan
                                </Badge>
                                <i
                                    className={classnames(
                                        'material-icons',
                                        css.chevron
                                    )}
                                >
                                    chevron_right
                                </i>
                                <Badge
                                    className={classnames(
                                        css.badge,
                                        css[currentPlanName.toLowerCase()]
                                    )}
                                >
                                    {`${currentPlanName} Plan`}
                                </Badge>
                            </div>
                            <h1 className={css.header}>
                                Offer self support via a knowledge base
                            </h1>
                            <p className={css.infoText}>
                                Create your own help center in order to help
                                users better understand your product and answer
                                frequently asked questions.
                                {currentPlanName === PlanName.Enterprise
                                    ? 'Contact your customer success manager to upgrade today!'
                                    : currentPlanName === PlanName.Advanced
                                    ? 'You can contact your customer success manager or do it from here to upgrade today!'
                                    : null}
                            </p>
                            <div>
                                {displayContactUsButton ? (
                                    <UpgradeButton
                                        className="mt-3 mb-5 d-inline-block"
                                        onClick={(e) => e && openChat(e)}
                                        label="Contact Us"
                                    />
                                ) : (
                                    <UpgradeButton
                                        className="mt-3 mb-5 d-inline-block"
                                        onClick={() =>
                                            setIsPlanChangeModalOpen(true)
                                        }
                                        label="Upgrade Your Plan"
                                    />
                                )}
                            </div>
                        </Col>
                    </Row>
                    <Lightbox
                        images={[{src: helpCenterImagePreview}]}
                        isOpen={isLightboxOpen}
                        onClose={() => setIsLightboxOpen(false)}
                        onClickImage={() => setIsLightboxOpen(false)}
                        backdropClosesModal
                    />
                </Container>
            </div>
            {suitablePlanWithoutAutomationAddOn && (
                <HelpCenterChangePlanModal
                    currentPlan={currentPlan}
                    suitablePlanWithoutAutomationAddOn={suitablePlanWithoutAutomationAddOn.toJS()}
                    isOpen={isPlanChangeModalOpen}
                    onClose={() => setIsPlanChangeModalOpen(false)}
                />
            )}
        </div>
    )
}

export default HelpCenterPaywall
