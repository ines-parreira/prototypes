import classnames from 'classnames'
import React, {useEffect, useRef, useState} from 'react'
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
import _pickBy from 'lodash/pickBy'

import LegacyTag from '../../../common/components/LegacyPlanBadge.tsx'
import './Plan.less'
import {openChat, toJS} from '../../../../utils.ts'
import {hasLegacyPlan, isFeatureEnabled} from '../../../../utils/account.ts'
import {AccountFeature} from '../../../../state/currentAccount/types.ts'

type Props = {
    plan: Map<any, any>,
    currentAccount: Map<any, any>,
    currentPlan: Map<any, any>,
    cheaperPlan: Map<any, any> | null,
    isFeatured?: boolean,
    isUpdating?: boolean,
    onClick?: Function,
    className?: string,
    isPopoverDisplayed?: boolean,
    isCurrentPlan?: boolean,
    comparaisonMode: boolean,
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
        name: AccountFeature.FacebookComment,
        icon: 'facebook',
        label: 'Facebook integration',
    },
    {
        name: AccountFeature.InstagramComment,
        icon: 'icon-instagram',
        label: 'Instagram integration',
        isCustomIcon: true,
    },
    {
        name: AccountFeature.MagentoIntegration,
        icon: 'widgets',
        label: 'Magento integration',
    },
    {
        name: AccountFeature.PhoneIntegration,
        icon: 'widgets',
        label: 'Phone integration',
    },
    {
        name: AccountFeature.SatisfactionSurveys,
        icon: 'insert_emoticon',
        label: 'Satisfaction surveys',
    },
    {
        name: AccountFeature.ChatCampaigns,
        icon: 'chat',
        label: 'Chat campaigns',
    },
    {
        name: AccountFeature.UserRoles,
        icon: 'lock',
        label: 'User permissions',
    },
    {
        name: AccountFeature.RevenueStatistics,
        icon: 'monetization_on',
        label: 'Revenue stats',
    },
    {
        name: AccountFeature.Teams,
        icon: 'group',
        label: 'Teams',
    },
    {
        name: AccountFeature.AutoAssignment,
        icon: 'assignment_turned_in',
        label: 'Auto-assignment',
    },
    {
        name: AccountFeature.ViewSharing,
        icon: 'visibility',
        label: 'View sharing',
    },
]

export const countFeatures = (features: AccountFeature) =>
    Object.values(features).filter(isFeatureEnabled).length

const getFeatures = (
    plan: Map<any, any>,
    cheaperPlan: Map<any, any> | null,
    showPlanLegacyFeatures: false
): Array<FeatureDetail> => {
    const costMultiplier = 100
    const costPerTicket = (
        plan.get('cost_per_ticket') * costMultiplier
    ).toFixed(2)
    const isEnterprisePlan = plan.get('id') === 'enterprise'
    const planFeatures = plan.get(
        showPlanLegacyFeatures ? 'legacy_features' : 'features'
    )
    const cheaperPlanFeatures = cheaperPlan ? cheaperPlan.get('features') : null
    const exclusiveFeatures = _pickBy(
        planFeatures.toJS(),
        (featureMetadata, featureName) =>
            isFeatureEnabled(featureMetadata) &&
            (!cheaperPlanFeatures ||
                !isFeatureEnabled(toJS(cheaperPlanFeatures.get(featureName))))
    )
    const exclusiveFeatureNames = Object.keys(exclusiveFeatures)

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

    features = features.concat(
        featuresConfig.filter((feature) => {
            return exclusiveFeatureNames.includes(feature.name)
        })
    )

    if (extraFeaturesPerPlan.hasOwnProperty(plan.get('name'))) {
        features = features.concat(extraFeaturesPerPlan[plan.get('name')])
    }
    return features
}

export function Plan(props: Props) {
    const {
        className,
        plan,
        cheaperPlan,
        isUpdating,
        currentAccount,
        currentPlan,
        isFeatured,
        isPopoverDisplayed,
        isCurrentPlan,
        comparaisonMode,
    } = props
    const [isConfirmationDisplayed, setIsConfirmationDisplayed] = useState(
        isPopoverDisplayed
    )
    const buttonRef = useRef()
    const [displayPopover, setDisplayPopover] = useState(false)
    const isEnterprisePlan = plan.get('id') === 'enterprise'
    const accountHasLegacyFeatures = currentAccount.getIn(
        ['meta', 'has_legacy_features'],
        false
    )
    const isDowngrade =
        !isCurrentPlan &&
        countFeatures(plan.get('features').toJS()) <
            countFeatures(
                currentPlan
                    .get(
                        accountHasLegacyFeatures
                            ? 'legacy_features'
                            : 'features'
                    )
                    .toJS()
            )
    const features = getFeatures(
        plan,
        cheaperPlan,
        isCurrentPlan && accountHasLegacyFeatures
    )
    const canChoosePlan = !isCurrentPlan && !isUpdating
    const isCurrentPlanLegacy =
        isCurrentPlan && hasLegacyPlan(currentAccount.toJS(), plan.toJS())

    useEffect(() => {
        setDisplayPopover(true)
    }, [buttonRef])

    return (
        <Card
            className={classnames(
                'plan',
                `plan-${plan.get('name')}`,
                className,
                {
                    featured: isFeatured,
                    comparaisonMode: comparaisonMode,
                    current: isCurrentPlan,
                    legacy: isCurrentPlan && accountHasLegacyFeatures,
                }
            )}
            outline
        >
            <CardHeader
                className={classnames('plan-header', {
                    'featured-header': isFeatured,
                })}
            >
                <div className="plan-badge">
                    {isCurrentPlanLegacy && <LegacyTag />}
                </div>
                {isFeatured && plan.get('public') && (
                    <div className="featured-header-title">Most Popular</div>
                )}
                <div className="header-text">
                    <strong>
                        {`${plan.get('name')}${
                            isCurrentPlanLegacy ? ' legacy' : ''
                        }`}
                    </strong>
                    {plan.get('amount') > 0 && (
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
            {comparaisonMode && (
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
                                    ? 'Current Plan'
                                    : `${
                                          isDowngrade ? 'Downgrade' : 'Upgrade'
                                      } to ${plan.get('name')} Plan`}
                            </Button>
                            {displayPopover && (
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
                                            onClick={(event) => {
                                                props.onClick(event)
                                                setIsConfirmationDisplayed(
                                                    false
                                                )
                                            }}
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
    isCurrentPlan: false,
    comparaisonMode: true,
}
