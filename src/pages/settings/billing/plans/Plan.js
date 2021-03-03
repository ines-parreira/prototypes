import classnames from 'classnames'
import React, {useRef, useState} from 'react'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Popover,
    PopoverBody,
    PopoverHeader,
} from 'reactstrap'
import _omitBy from 'lodash/omitBy'

import LegacyTag from '../../../common/components/LegacyTag.tsx'
import './Plan.less'
import {openChat} from '../../../../utils.ts'

type Props = {
    plan: Map<any, any>,
    currentPlan: Map<any, any>,
    cheaperPlan: Map<any, any> | null,
    showFooter: boolean,
    showProductFeatures: boolean,
    isFeatured?: boolean,
    isUpdating?: boolean,
    onClick?: Function,
    className?: string,
}

type FeatureDetail = {
    name?: string,
    isCustomIcon?: boolean,
    icon: string,
    label: string,
}

const extraFeaturesPerPlan = {
    Basic: [
        {
            icon: 'all_inclusive',
            label: 'Unlimited users',
        },
        {
            icon: 'extension',
            label: '150 integrations included',
        },
        {
            icon: 'widgets',
            label: 'Shopify integration',
        },
        {
            icon: 'chat',
            label: 'Live chat',
        },
        {
            icon: 'build',
            label: 'Macros and rules',
        },
    ],
    Pro: [],
    Advanced: [
        {
            icon: 'call',
            label: 'Customer success manager',
        },
    ],
    Enterprise: [
        {
            icon: 'arrow_downward',
            label: 'Discounted prices for volumes of 10.000+ tickets',
        },
        {
            icon: 'beach_access',
            label: 'Premium support',
        },
    ],
}

const featuresConfig = [
    {
        name: 'facebook_comment',
        icon: 'facebook',
        label: 'Facebook integration',
    },
    {
        name: 'instagram_comment',
        icon: 'icon-instagram',
        label: 'Instagram integration',
        isCustomIcon: true,
    },
    {
        name: 'magento_integration',
        icon: 'widgets',
        label: 'Magento integration',
    },
    {
        name: 'satisfaction_surveys',
        icon: 'insert_emoticon',
        label: 'Satisfaction surveys',
    },
    {
        name: 'chat_campaigns',
        icon: 'chat',
        label: 'Chat campaigns',
    },
    {
        name: 'user_roles',
        icon: 'lock',
        label: 'User permissions',
    },
    {
        name: 'revenue_statistics',
        icon: 'monetization_on',
        label: 'Revenue stats',
    },
    {
        name: 'teams',
        icon: 'group',
        label: 'Teams',
    },
    {
        name: 'auto_assignment',
        icon: 'assignment_turned_in',
        label: 'Auto-assignment',
    },
    {
        name: 'view_sharing',
        icon: 'visibility',
        label: 'View sharing',
    },
]

const countFeatures = (plan: Map<any, any>) => {
    return plan
        .get('features')
        .valueSeq()
        .filter((hasFeature) => hasFeature)
        .count()
}

const getFeatures = (
    plan: Map<any, any>,
    cheaperPlan: Map<any, any> | null,
    includeProductFeatures: true
): Array<FeatureDetail> => {
    const costMultiplier = 100
    const costPerTicket = (
        plan.get('cost_per_ticket') * costMultiplier
    ).toFixed(2)
    const isEnterprisePlan = plan.get('id') === 'enterprise'
    const planFeatures = Object.keys(
        _omitBy(plan.get('features').toJS(), (hasFeature, featureName) => {
            return !(
                hasFeature &&
                (!cheaperPlan || !cheaperPlan.getIn(['features', featureName]))
            )
        })
    )
    let features = isEnterprisePlan
        ? []
        : [
              {
                  icon: 'playlist_add_check',
                  label: `${plan.get('free_tickets')} tickets included`,
              },
              {
                  icon: 'playlist_add',
                  label: `$${costPerTicket} per ${costMultiplier} extra tickets`,
              },
          ]

    if (includeProductFeatures) {
        features = features.concat(
            featuresConfig.filter((feature) => {
                return planFeatures.includes(feature.name)
            })
        )

        if (extraFeaturesPerPlan.hasOwnProperty(plan.get('name'))) {
            features = features.concat(extraFeaturesPerPlan[plan.get('name')])
        }
    }
    return features
}

export function Plan(props: Props) {
    const {
        className,
        cheaperPlan,
        plan,
        isUpdating,
        currentPlan,
        isFeatured,
        showFooter,
        showProductFeatures,
    } = props
    const [isConfirmationDisplayed, setIsConfirmationDisplayed] = useState(
        false
    )
    const buttonRef = useRef(null)
    const isEnterprisePlan = plan.get('id') === 'enterprise'
    const isCurrentPlan = currentPlan.get('id') === plan.get('id')
    const isDowngrade = currentPlan.isEmpty()
        ? false
        : countFeatures(plan) < countFeatures(currentPlan)
    const features = getFeatures(plan, cheaperPlan, showProductFeatures)
    const canChoosePlan = !isCurrentPlan && !isUpdating

    return (
        <Card
            className={classnames(
                'plan',
                `plan-${plan.get('name')}`,
                className,
                {
                    featured: isFeatured,
                }
            )}
            outline
        >
            <CardHeader
                className={classnames('plan-header', {
                    'featured-header': isFeatured,
                })}
            >
                {!plan.get('public') && !isEnterprisePlan && (
                    <LegacyTag label="Legacy Plan" labelIcon="warning" />
                )}
                {isFeatured && plan.get('public') && (
                    <div className="featured-header-title">Most Popular</div>
                )}
                <div className="header-text">
                    <strong>{plan.get('name')}</strong>

                    {plan.get('amount') && (
                        <span className="float-right">
                            {plan.get('currencySign')}
                            {plan.get('amount')} /{' '}
                            {plan.get('interval') === 'month' ? 'mo' : 'yr'}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardBody>
                {cheaperPlan && (
                    <b>Everything from {cheaperPlan.get('name')} plus...</b>
                )}
                <ul>
                    {features.map((feature) => {
                        return (
                            <li
                                key={feature.label}
                                className="d-flex align-items-center"
                            >
                                {feature.isCustomIcon ? (
                                    <i
                                        className={classnames(
                                            'feature-icon icon-custom mr-3',
                                            feature.icon
                                        )}
                                    />
                                ) : (
                                    <i className="material-icons feature-icon mr-3">
                                        {feature.icon}
                                    </i>
                                )}
                                <strong>{feature.label}</strong>
                            </li>
                        )
                    })}
                </ul>
            </CardBody>
            {!currentPlan.get('custom') && showFooter && (
                <CardFooter>
                    {isEnterprisePlan ? (
                        <Button color="link" onClick={openChat}>
                            Contact us
                        </Button>
                    ) : (
                        <>
                            <Button
                                innerRef={buttonRef}
                                data-testid="choose-plan-button"
                                className={classnames({
                                    'btn-loading': isUpdating,
                                })}
                                color="link"
                                disabled={!canChoosePlan}
                                onClick={() => {
                                    if (canChoosePlan) {
                                        setIsConfirmationDisplayed(
                                            !isConfirmationDisplayed
                                        )
                                    }
                                }}
                            >
                                {isCurrentPlan
                                    ? 'Your current Plan'
                                    : `Switch to ${plan.get('name')} Plan`}
                            </Button>
                            {buttonRef.current && (
                                <Popover
                                    placement="top"
                                    isOpen={isConfirmationDisplayed}
                                    target={buttonRef.current}
                                    toggle={() =>
                                        setIsConfirmationDisplayed(
                                            !isConfirmationDisplayed
                                        )
                                    }
                                    trigger="legacy"
                                >
                                    <PopoverHeader>Are you sure?</PopoverHeader>
                                    <PopoverBody>
                                        <p>
                                            Are you sure you want to choose the{' '}
                                            {plan.get('name')} plan?
                                            {isDowngrade && (
                                                <>
                                                    <b>
                                                        This plan does not
                                                        include some of the
                                                        features included in
                                                        your existing plan.
                                                    </b>{' '}
                                                    You might want to keep your
                                                    existing plan to not have
                                                    these features deactivated.
                                                </>
                                            )}
                                        </p>

                                        <Button
                                            data-testid="confirm-choose-plan-button"
                                            type="button"
                                            color="success"
                                            onClick={props.onClick}
                                        >
                                            Confirm
                                        </Button>
                                    </PopoverBody>
                                </Popover>
                            )}
                        </>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}

Plan.defaultProps = {
    isFeatured: false,
    isUpdating: false,
    className: null,
    showFooter: true,
    showProductFeatures: true,
}
