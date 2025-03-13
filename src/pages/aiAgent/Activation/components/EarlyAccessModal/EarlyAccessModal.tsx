import React from 'react'

import cn from 'classnames'

import { Badge, Button, Skeleton } from '@gorgias/merchant-ui-kit'

import { AutomateEarlyAccessPlan, AutomatePlan } from 'models/billing/types'
import {
    getAutomateEarlyAccessPricesFormatted,
    getPlanPriceFormatted,
} from 'models/billing/utils'
import {
    Card,
    CardCaption,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './EarlyAccessModal.less'

type Props = {
    isLoading: boolean
    onUpgradeClick: () => void
    onStayClick: () => void
    onClose: () => void
    isOpen: boolean
    currentPlan?: AutomatePlan | null
    earlyAccessPlan?: AutomateEarlyAccessPlan | null
    disableUpgradeButton: boolean
}
export const EarlyAccessModal = ({
    isLoading,
    onUpgradeClick,
    onStayClick,
    onClose,
    isOpen,
    currentPlan,
    earlyAccessPlan,
    disableUpgradeButton,
}: Props) => {
    const { amountAfterDiscount, discount } =
        getAutomateEarlyAccessPricesFormatted(earlyAccessPlan)
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            classNameDialog={css.modalDialog}
            classNameContent={css.modalContent}
            size="large"
        >
            <ModalHeader
                title={<h1>Upgrade & Get Early Access Pricing</h1>}
                subtitle={
                    <h3>
                        Sign up before May 2025 to secure your current pricing
                        tier before rates increase.
                    </h3>
                }
                className={css.header}
            />
            <ModalBody className={css.body}>
                <Card className={cn(css.card, css.currentPlanCard)}>
                    <CardHeader className={css.header}>
                        <CardTitle className={css.cardTitle}>
                            Current Plan
                            <Badge type="light-warning" corner="square">
                                Prices will increase after May 2025
                            </Badge>
                        </CardTitle>
                        <CardCaption
                            className={css.caption}
                            title="With Support Only"
                        >
                            with support only
                        </CardCaption>
                    </CardHeader>
                    <CardContent className={css.content}>
                        <div className={css.contentGrid}>
                            <div className={css.innerContent}>
                                <h3>AI Agent Skills</h3>
                                <div className={css.skill}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            check_circle
                                        </i>
                                    </span>
                                    <span className={css.skillName}>
                                        Support
                                    </span>
                                </div>
                                <div className={css.skill}>
                                    <span
                                        className={cn(
                                            css.skillStatus,
                                            css.skillStatusDisabled,
                                        )}
                                    >
                                        <i className="material-icons">cancel</i>
                                    </span>
                                    <span className={css.skillName}>Sales</span>
                                </div>
                            </div>
                            <div className={css.innerContent}>
                                <h3>Cost Structure</h3>
                                <div className={css.costItem}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            arrow_right
                                        </i>
                                    </span>
                                    <span>$0.60</span> per automated
                                    conversation
                                </div>
                                <div className={css.costItem}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            arrow_right
                                        </i>
                                    </span>
                                    <span>$0.20</span> per Helpdesk ticket
                                </div>
                                <div className={css.costItem}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            arrow_right
                                        </i>
                                    </span>
                                    <span>Overage:</span> $1.00
                                </div>
                            </div>
                            <div className={css.innerContent}>
                                <h3>Current Pricing</h3>
                                <span className={css.price}>
                                    {isLoading ? (
                                        <Skeleton width={140} />
                                    ) : (
                                        `${getPlanPriceFormatted(currentPlan)}/${currentPlan?.cadence}`
                                    )}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn(css.card, css.earlyAccessPlanCard)}>
                    <CardHeader className={css.header}>
                        <CardTitle className={css.cardTitle}>
                            Early Access Plan
                            <Badge type="blue" corner="square">
                                Current price locked for next 12 months
                            </Badge>
                        </CardTitle>
                        <CardCaption
                            className={css.caption}
                            title="With Support Only"
                        >
                            Upgrade with Support and Sales
                        </CardCaption>
                    </CardHeader>
                    <CardContent className={css.content}>
                        <div className={css.contentGrid}>
                            <div className={css.innerContent}>
                                <h3>AI Agent Skills</h3>
                                <div className={css.skill}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            check_circle
                                        </i>
                                    </span>
                                    <span className={css.skillName}>
                                        Support
                                    </span>
                                </div>
                                <div className={css.skill}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            check_circle
                                        </i>
                                    </span>
                                    <span className={css.skillName}>Sales</span>
                                </div>
                            </div>
                            <div className={css.innerContent}>
                                <h3>Cost Structure</h3>
                                <div className={css.costItem}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            arrow_right
                                        </i>
                                    </span>
                                    <span>$0.60</span> per automated
                                    conversation
                                </div>
                                <div className={css.costItem}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            arrow_right
                                        </i>
                                    </span>
                                    <span>$0.20</span> per Helpdesk ticket
                                </div>
                                <div className={css.costItem}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            arrow_right
                                        </i>
                                    </span>
                                    <span>Overage:</span> $1.00
                                </div>
                            </div>
                            <div className={cn(css.innerContent, css.newPrice)}>
                                <h3>Current Pricing</h3>
                                <span className={css.price}>
                                    {isLoading ? (
                                        <Skeleton width={140} height={22} />
                                    ) : (
                                        `${amountAfterDiscount}/${currentPlan?.cadence}`
                                    )}
                                </span>
                                <span className={css.subPrice}>
                                    {isLoading ? (
                                        <Skeleton width={210} height={12} />
                                    ) : (
                                        `${discount}/${currentPlan?.cadence} for 12 months`
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className={css.tips}>
                            <div className={css.tipTitle}>
                                <h3>
                                    <i className="material-icons">
                                        auto_awesome
                                    </i>
                                    Grow GMV with Sales Skills for your AI Agent
                                </h3>
                            </div>
                            <ul className={css.tipList}>
                                <li>
                                    <i className="material-icons">flare</i>
                                    <span>
                                        Meet the first AI Agent that sells via
                                        playbook
                                    </span>
                                </li>
                                <li>
                                    <i className="material-icons">flare</i>
                                    <span>
                                        Delivers tailored recommendations driven
                                        by customer behavior
                                    </span>
                                </li>
                                <li>
                                    <i className="material-icons">flare</i>
                                    <span>
                                        AI predicts intent, adjusts discounts,
                                        adapts engagement, and provides smart
                                        incentives to drive sales
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </ModalBody>
            <ModalFooter className={css.footer}>
                <Button
                    fillStyle="fill"
                    intent="primary"
                    size="medium"
                    className={css.principalButton}
                    onClick={onUpgradeClick}
                    isDisabled={disableUpgradeButton}
                >
                    Upgrade AI Agent With Early Access Plan
                </Button>
                <Button
                    fillStyle="ghost"
                    intent="primary"
                    size="medium"
                    className={css.secondaryButton}
                    onClick={onStayClick}
                >
                    Stay On Current Plan
                </Button>
            </ModalFooter>
        </Modal>
    )
}
