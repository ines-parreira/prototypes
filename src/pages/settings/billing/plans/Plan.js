import classnames from 'classnames'
import React, {useEffect, useRef, useState} from 'react'
import {connect} from 'react-redux'
import {
    Badge,
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
import type {Record} from 'immutable'

import LegacyPlanBadge from '../../../common/components/LegacyPlanBadge.tsx'
import './Plan.less'
import {openChat} from '../../../../utils.ts'
import {isFeatureEnabled} from '../../../../utils/account.ts'
import {AccountFeature} from '../../../../state/currentAccount/types.ts'
import * as billingSelectors from '../../../../state/billing/selectors.ts'
import Tooltip from '../../../common/components/Tooltip.tsx'

type Props = {
    plan: Map<any, any>,
    currentAccount: Map<any, any>,
    currentPlan: Map<any, any>,
    isLegacyPlan: boolean,
    isFeatured?: boolean,
    isUpdating?: boolean,
    onClick?: Function,
    className?: string,
    isPopoverDisplayed?: boolean,
    isCurrentPlan?: boolean,
    comparaisonMode: boolean,
    planColors?: Record<string, string>,
}

type FeatureDetail = {
    name?: string,
    isCustomIcon?: boolean,
    icon: string,
    label: string | Node,
    disabled: boolean,
}

const extraFeatures = (plan: string) => [
    {
        icon: 'person_pin',
        label: 'Dedicated success manager',
        disabled: !(plan.includes('advanced') || plan.includes('enterprise')),
    },
    {
        icon: 'blur_on',
        label: 'Custom services',
        disabled: plan !== plan.includes('enterprise'),
    },
]

const featuresConfig = [
    {
        name: AccountFeature.MagentoIntegration,
        icon: 'vector',
        label: 'Magento integration',
    },
    {
        name: AccountFeature.UserRoles,
        icon: 'supervised_user_circle',
        label: 'User permissions',
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
        name: AccountFeature.PhoneIntegration,
        icon: 'phone',
        label: 'Phone integration',
    },
    {
        name: AccountFeature.Teams,
        icon: 'people_outline',
        label: 'Team Management',
    },
    {
        name: AccountFeature.ViewSharing,
        icon: 'view_carousel',
        label: 'View sharing',
    },
    {
        name: AccountFeature.RevenueStatistics,
        icon: 'attach_money',
        label: 'Revenue statistics',
    },
]

export const countFeatures = (features: AccountFeature) =>
    Object.values(features).filter(isFeatureEnabled).length

const getFeatures = (
    plan: Map<any, any>,
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
    const enabledFeatures = _pickBy(planFeatures.toJS(), (featureMetadata) =>
        isFeatureEnabled(featureMetadata)
    )
    const enabledFeaturesNames = Object.keys(enabledFeatures)

    let features = isEnterprisePlan
        ? [
              {
                  icon: 'playlist_add_check',
                  label: (
                      <>
                          Discounted prices for{' '}
                          <b>volumes of 10.000+ billable tickets</b>
                      </>
                  ),
              },
              {
                  icon: 'beach_access',
                  label: 'Premium support',
              },
              {
                  icon: 'code',
                  label: 'Custom limit of integrations',
              },
              {
                  icon: 'thumb_up_alt',
                  label: 'Social media integrations',
              },
              {
                  icon: 'forum',
                  label: 'Live chat',
              },
              {
                  icon: 'auto_awesome',
                  label: 'Macros and rules',
              },
              {
                  icon: 'directions_car',
                  label: 'Full onboarding',
              },
          ]
        : [
              {
                  icon: 'playlist_add_check',
                  label: (
                      <>
                          <b>{plan.get('free_tickets')}</b>{' '}
                          <span
                              id="billable-ticket-label"
                              className="billable-ticket"
                          >
                              billable tickets
                          </span>{' '}
                          included
                          <Tooltip
                              target="billable-ticket-label"
                              placement="top-start"
                              innerClassName="billable-ticket-tooltip"
                          >
                              A billable ticket is a ticket that received a
                              response either from an agent or a rule. Only the
                              ticket itself is billable, additional messages in
                              this ticket are not billable.
                          </Tooltip>
                      </>
                  ),
                  disabled: false,
              },
              {
                  icon: 'playlist_add',
                  label: (
                      <>
                          <b>
                              {plan.get('currencySign')}
                              {costPerTicket}
                          </b>{' '}
                          per {costMultiplier} extra tickets
                      </>
                  ),
                  disabled: false,
              },
              {
                  icon: 'code',
                  label: (
                      <>
                          <b>{plan.get('integrations')}</b> integrations
                      </>
                  ),
                  disabled: false,
              },
              {
                  icon: 'thumb_up_alt',
                  label: 'Social media integrations',
              },
              {
                  icon: 'forum',
                  label: 'Live chat',
              },
              {
                  icon: 'auto_awesome',
                  label: 'Macros and rules',
              },
              {
                  icon: `${
                      plan.get('name') === 'Advanced'
                          ? 'directions_car'
                          : plan.get('name') === 'Basic'
                          ? 'directions_walk'
                          : 'directions_bike'
                  }`,
                  label: `${
                      plan.get('name') === 'Advanced'
                          ? 'Full'
                          : plan.get('name') === 'Basic'
                          ? 'Self'
                          : 'Lite'
                  } onboarding`,
              },
          ]

    features = features.concat(
        featuresConfig.map((feature) => {
            if (
                feature.name === AccountFeature.PhoneIntegration &&
                planFeatures
            ) {
                const phoneNumbers = planFeatures.getIn([
                    AccountFeature.PhoneIntegration,
                    'limit',
                ])
                return {
                    ...feature,
                    disabled: !enabledFeaturesNames.includes(feature.name),
                    label: phoneNumbers ? (
                        <>
                            <b>{phoneNumbers}</b> Phone numbers
                        </>
                    ) : (
                        'Phone'
                    ),
                }
            }
            return {
                ...feature,
                disabled: !enabledFeaturesNames.includes(feature.name),
            }
        })
    )
    features = features.concat(extraFeatures(plan.get('id')))

    return features
}

export function Plan({
    className,
    plan,
    isUpdating,
    currentAccount,
    currentPlan,
    isFeatured,
    isPopoverDisplayed,
    isCurrentPlan,
    comparaisonMode,
    onClick,
    planColors = {Pro: 'info', Advanced: 'success', Basic: 'primary'},
    isLegacyPlan,
}: Props) {
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
        !currentPlan.isEmpty() &&
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
        isCurrentPlan && accountHasLegacyFeatures
    )
    const canChoosePlan = !isCurrentPlan && !isUpdating

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
                    {!isCurrentPlan ? null : isLegacyPlan ? (
                        <LegacyPlanBadge />
                    ) : (
                        comparaisonMode && (
                            <Badge
                                color={
                                    isEnterprisePlan
                                        ? 'warning'
                                        : planColors[plan.get('name')]
                                }
                            >
                                CURRENT PLAN
                            </Badge>
                        )
                    )}
                </div>
                <div className="header-text">
                    <strong>{plan.get('name')}</strong>
                    {plan.get('amount') > 0 && (
                        <span className="plan-header-details">
                            {plan.get('currencySign')}
                            {plan.get('amount')} /{' '}
                            {plan.get('interval') === 'month' ? 'mo' : 'yr'}
                        </span>
                    )}
                    {plan.get('id') === 'enterprise' && (
                        <span className="plan-header-details">
                            Custom price
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardBody>
                <ul>
                    {features.map((feature) => {
                        const isFeatureDisabled =
                            !isEnterprisePlan && feature.disabled
                        if (feature.label === 'Magento integration')
                            return (
                                <li
                                    key={`${plan.get('id')}_${feature.icon}}`}
                                    className="d-flex align-items-center"
                                >
                                    <div
                                        className={classnames(
                                            'feature-icon mr-3',
                                            {
                                                'feature-icon-disabled': isFeatureDisabled,
                                            }
                                        )}
                                    >
                                        <i
                                            className={classnames({
                                                disabled: isFeatureDisabled,
                                            })}
                                        />
                                    </div>
                                    <div
                                        className={classnames({
                                            'feature-label-disabled': isFeatureDisabled,
                                        })}
                                    >
                                        {feature.label}
                                    </div>
                                </li>
                            )
                        return (
                            <li
                                key={`${plan.get('id')}_${feature.icon}}`}
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
                                    <i
                                        className={classnames(
                                            'material-icons feature-icon mr-3',
                                            {
                                                'feature-icon-disabled': isFeatureDisabled,
                                            }
                                        )}
                                    >
                                        {feature.icon}
                                    </i>
                                )}
                                <div
                                    className={classnames({
                                        'feature-label-disabled': isFeatureDisabled,
                                    })}
                                >
                                    {feature.label}
                                </div>
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
                                          plan.get('name') ===
                                          currentPlan.get('name')
                                              ? 'Switch'
                                              : isDowngrade
                                              ? 'Downgrade'
                                              : 'Upgrade'
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
                                                onClick(event)
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

export default connect((state) => {
    return {
        isLegacyPlan: billingSelectors.hasLegacyPlan(state),
    }
})(Plan)
