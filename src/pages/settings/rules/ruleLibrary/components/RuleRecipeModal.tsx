import React, {ReactNode, useState} from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import {RuleRecipe} from 'models/ruleRecipe/types'
import Loader from 'pages/common/components/Loader/Loader'
import CheckBox from 'pages/common/forms/CheckBox'
import history from 'pages/history'
import Alert from 'pages/common/components/Alert/Alert'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {RuleType} from 'state/rules/types'
import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'
import AutomationSubscriptionFeatures from 'pages/settings/billing/automation/AutomationSubscriptionFeatures'

import {RuleItemActions} from '../../types'

import InstallRuleModalBody from './InstallRuleModalBody'

import css from './RuleRecipeModal.less'

type Props = {
    recipe: RuleRecipe
    handleInstall: (
        shouldCreateViews: boolean,
        shouldGoToRule?: boolean
    ) => Promise<void>
    renderTags: () => ReactNode
    handleRule: RuleItemActions
    isOpen: boolean
    onToggle: () => void
    shouldInstall: boolean
    managedRuleId?: number
}

export const RuleRecipeModal = ({
    recipe,
    handleInstall,
    renderTags,
    handleRule,
    isOpen,
    onToggle,
    shouldInstall,
    managedRuleId,
}: Props) => {
    const {rule, triggered_count, views_per_section} = recipe
    const [shouldCreateviews, setShouldCreateViews] = useState(true)
    const [showAutomationModal, setShowAutomationModal] = useState(false)
    const [isSubscribing, setIsSubscribing] = useState(false)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const isBehindPaywall =
        rule.type === RuleType.Managed && !hasAutomationAddOn

    const handleSubscription = () => {
        if (!managedRuleId) {
            void handleInstall(shouldCreateviews, true).then(() => {
                setIsSubscribing(false)
            })
        } else {
            history.push(`/app/settings/rules/${managedRuleId}`)
        }
    }

    const InstallButton = () =>
        isBehindPaywall ? (
            <Button
                color="primary"
                onClick={() => setShowAutomationModal(true)}
            >
                <i className="material-icons mr-2">auto_awesome</i>
                Subscribe to automation add-on
            </Button>
        ) : (
            <Button
                color="primary"
                onClick={() => {
                    void handleInstall(
                        shouldCreateviews,
                        rule.type === 'managed'
                    )
                    onToggle()
                }}
                disabled={!shouldInstall}
            >
                Install rule
            </Button>
        )

    const ViewsCreationCheckbox = () => {
        if (!views_per_section) return <></>
        return (
            <CheckBox
                className="mb-1 mt-3"
                isChecked={shouldCreateviews}
                onChange={(newValue: boolean) => setShouldCreateViews(newValue)}
            >
                Create the views related to this rule.
            </CheckBox>
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
                {isBehindPaywall ? (
                    <>Access to next level automation features 🤖</>
                ) : (
                    <>
                        <span>{rule.name}</span>
                        <span className={css.tags}>{renderTags()}</span>
                    </>
                )}
            </ModalHeader>
            {isSubscribing ? (
                <ModalBody>
                    <Loader />
                </ModalBody>
            ) : (
                <ModalBody>
                    {isBehindPaywall && (
                        <div className={css.automationHeader}>
                            <Alert
                                icon={
                                    <i
                                        className={classnames(
                                            css.icon,
                                            'material-icons'
                                        )}
                                    >
                                        auto_awesome
                                    </i>
                                }
                            >
                                Customers automate up to 5% of all interactions
                                with our new automation add-on!
                            </Alert>
                            <AutomationSubscriptionFeatures />
                        </div>
                    )}
                    <InstallRuleModalBody
                        handleRule={handleRule}
                        triggeredCount={triggered_count}
                        rule={rule}
                        isBehindPaywall={isBehindPaywall}
                        renderTags={renderTags}
                        viewCreationCheckbox={ViewsCreationCheckbox}
                    />
                </ModalBody>
            )}
            <ModalFooter className={css.modalFooter}>
                <Button onClick={onToggle}>Cancel</Button>
                <InstallButton />
            </ModalFooter>
        </Modal>
    ) : (
        <AutomationSubscriptionModal
            confirmLabel="Confirm"
            isOpen={showAutomationModal}
            onClose={() => setShowAutomationModal(false)}
            onSubscribe={handleSubscription}
            fade={false}
        />
    )
}
