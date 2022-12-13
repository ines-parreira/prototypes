import React, {useCallback, useState} from 'react'
import {Badge, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'
import pluralize from 'pluralize'
import _flatten from 'lodash/flatten'

import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'
import {RuleRecipe} from 'models/ruleRecipe/types'
import Loader from 'pages/common/components/Loader/Loader'
import CheckBox from 'pages/common/forms/CheckBox'
import history from 'pages/history'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {
    AnyManagedRuleSettings,
    RuleLimitStatus,
    RuleType,
} from 'state/rules/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'
import AutomationSubscriptionButton from 'pages/settings/billing/automation/AutomationSubscriptionButton'

import Tooltip from 'pages/common/components/Tooltip'
import {getRulesLimitStatus} from 'state/entities/rules/selectors'
import {RuleItemActions} from '../../types'

import {
    InstallationError,
    InstallationErrorMessage,
    tagColors,
} from '../constants'
import InstallRuleModalBody from './InstallRuleModalBody'

import css from './RuleRecipeModal.less'

type Props = {
    recipe: RuleRecipe
    handleInstall: (shouldCreateViews: boolean) => Promise<void>
    handleRule: RuleItemActions
    isOpen: boolean
    onToggle: () => void
    shouldInstall: boolean
    managedRuleId?: number
    handleDefaultSettings: (settings: Partial<AnyManagedRuleSettings>) => void
    shouldHandleError: boolean
}

export const RuleRecipeModal = ({
    recipe,
    handleInstall,
    handleRule,
    isOpen,
    onToggle,
    shouldInstall,
    managedRuleId,
    handleDefaultSettings,
    shouldHandleError,
}: Props) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {rule, slug, triggered_count, views_per_section} = recipe
    const [shouldCreateviews, setShouldCreateViews] = useState(true)
    const [showAutomationModal, setShowAutomationModal] = useState(false)
    const [isSubscribing, setIsSubscribing] = useState(false)
    const ruleLimitStatus = useAppSelector(getRulesLimitStatus)
    const [installationErrors, setInstallationErrors] = useState<
        InstallationError[]
    >(
        ruleLimitStatus === RuleLimitStatus.Reached
            ? [InstallationError.MaxRulesReached]
            : []
    )
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const isBehindPaywall =
        rule.type === RuleType.Managed && !hasAutomationAddOn

    const handleSubscription = () => {
        if (!managedRuleId) {
            logEvent(SegmentEvent.RuleAutomationAddOnSubscription, {
                from: 'managed-rule',
                domain: currentAccount?.get('domain'),
            })
            void handleInstall(shouldCreateviews).then(() => {
                setIsSubscribing(false)
            })
        } else {
            history.push(`/app/settings/rules/${managedRuleId}`)
        }
    }

    const installButtonId = `${slug}-install-button`
    const isInstallationDisabled = !shouldInstall || !!installationErrors.length
    const handleInstallationErrors = useCallback(
        (installationError: InstallationError) => {
            if (
                shouldHandleError &&
                !installationErrors.find((error) => error === installationError)
            ) {
                setInstallationErrors([
                    ...installationErrors,
                    installationError,
                ])
            }
        },
        [installationErrors, shouldHandleError]
    )
    const ErrorTooltip = () => (
        <Tooltip
            trigger={['hover']}
            target={`#${installButtonId}`}
            className={css.tooltip}
        >
            {installationErrors
                .map((error) => InstallationErrorMessage[error])
                .join(' ')}
        </Tooltip>
    )

    const InstallButton = () =>
        isBehindPaywall ? (
            <>
                <span id={installButtonId}>
                    <AutomationSubscriptionButton
                        id={installButtonId}
                        onClick={() => {
                            logEvent(SegmentEvent.RuleAutomationAddOnUpsell, {
                                from: 'managed-rule',
                                domain: currentAccount?.get('domain'),
                            })
                            setShowAutomationModal(true)
                        }}
                        isDisabled={isInstallationDisabled}
                        className={classnames({
                            [css.disabledButton]: isInstallationDisabled,
                        })}
                        position="left"
                        label="Add Automation Features to Install"
                    />
                </span>
                {!!installationErrors.length && <ErrorTooltip />}
            </>
        ) : (
            <>
                <span id={installButtonId}>
                    <Button
                        intent="primary"
                        onClick={() => {
                            void handleInstall(shouldCreateviews)
                            onToggle()
                        }}
                        isDisabled={isInstallationDisabled}
                        className={classnames({
                            [css.disabledButton]: isInstallationDisabled,
                        })}
                    >
                        Install rule
                    </Button>
                </span>
                {!!installationErrors.length && <ErrorTooltip />}
            </>
        )

    const ViewsCreationCheckbox = () => {
        if (!views_per_section) return <></>

        const viewNames = _flatten(Object.values(views_per_section)).map(
            ({name}) => name
        )

        const viewDescriptions: Record<string, string> = {
            'Order status': 'if tickets contain a shipping-related intent',
            Returns: 'if tickets contain a return or exchange-related intent',
            'Order updates':
                'if tickets contain order change or cancel-related intents',
            Product: 'if the tickets contain a product-related intent',
        }

        const allViewsHaveDescriptions = viewNames.every(
            (name) => viewDescriptions[name]
        )

        return (
            <>
                {allViewsHaveDescriptions ? (
                    <div className={css.descriptionBlock}>
                        <h4>Ticket views</h4>
                        <p className="mb-1">
                            The views created by this rule include:
                        </p>
                        {viewNames.map((name) => (
                            <p className="mb-1" key={name}>
                                - {name}: {viewDescriptions[name]}
                            </p>
                        ))}
                    </div>
                ) : (
                    ''
                )}
                <CheckBox
                    labelClassName="align-items-start"
                    isChecked={shouldCreateviews}
                    onChange={(newValue: boolean) =>
                        setShouldCreateViews(newValue)
                    }
                >
                    <div>
                        <div className={css.viewsLabel}>
                            {allViewsHaveDescriptions
                                ? 'Create the ticket views listed above to see tickets that trigger this rule.'
                                : `Create the ticket ${pluralize(
                                      'view',
                                      viewNames.length
                                  )} ${viewNames
                                      .map((name) => `"${name}"`)
                                      .join(
                                          ' and '
                                      )} to see tickets that trigger this rule.`}
                        </div>
                        <div className={css.viewsSecondaryLabel}>
                            You can always edit ticket view names after
                            installing.
                        </div>
                    </div>
                </CheckBox>
            </>
        )
    }

    return !showAutomationModal ? (
        <Modal
            isOpen={isOpen}
            toggle={onToggle}
            fade={false}
            size="lg"
            className={css.modalContainer}
            centered
        >
            <ModalHeader toggle={onToggle}>
                <div className={css.header}>
                    <span className={classnames(css.name, 'mr-2')}>
                        {rule.name}
                    </span>
                    <Badge
                        key={recipe.recipe_tag}
                        cssModule={{badge: css.badge}}
                        style={tagColors[recipe.recipe_tag]}
                    >
                        {recipe.recipe_tag}
                    </Badge>
                </div>
            </ModalHeader>
            {isSubscribing ? (
                <ModalBody>
                    <Loader />
                </ModalBody>
            ) : (
                <ModalBody>
                    <InstallRuleModalBody
                        handleRule={handleRule}
                        triggeredCount={triggered_count}
                        rule={rule}
                        recipeSlug={recipe.slug}
                        viewCreationCheckbox={ViewsCreationCheckbox}
                        handleInstallationError={handleInstallationErrors}
                        handleDefaultSettings={handleDefaultSettings}
                    />
                </ModalBody>
            )}
            <ModalFooter className={css.modalFooter}>
                <Button intent="secondary" onClick={onToggle}>
                    Cancel
                </Button>
                <InstallButton />
            </ModalFooter>
        </Modal>
    ) : (
        <AutomationSubscriptionModal
            confirmLabel="Subscribe &amp; Install Rule"
            isOpen={showAutomationModal}
            onClose={() => setShowAutomationModal(false)}
            onSubscribe={handleSubscription}
            fade={false}
        />
    )
}
