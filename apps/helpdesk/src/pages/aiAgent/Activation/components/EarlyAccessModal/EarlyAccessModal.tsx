import { useState } from 'react'

import cn from 'classnames'

import {
    LegacyBadge as Badge,
    LegacyCheckBoxField as CheckBoxField,
    Skeleton,
} from '@gorgias/axiom'

import type { AutomatePlan, HelpdeskPlan, Plan } from 'models/billing/types'
import { getPlanPriceFormatted } from 'models/billing/utils'
import {
    Card,
    CardCaption,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/components/Card'
import { AIButton } from 'pages/common/components/AIButton/AIButton'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'

import css from './EarlyAccessModal.less'

type Props = {
    isLoading: boolean
    onUpgradeClick: () => void
    onClose: () => void
    isOpen: boolean
    currentPlan?: AutomatePlan | null
    helpdeskPlan?: HelpdeskPlan | null
    earlyAccessPlan?: Plan | null
    userIsAdmin: boolean
    isUpgrading: boolean
}
export const EarlyAccessModal = ({
    isLoading,
    onUpgradeClick,
    onClose,
    isOpen,
    currentPlan,
    helpdeskPlan,
    earlyAccessPlan,
    userIsAdmin,
    isUpgrading,
}: Props) => {
    const price = getPlanPriceFormatted(earlyAccessPlan)
    const currency = currentPlan?.currency ?? 'USD'

    const helpdeskPlanTicketCost = formatAmount(
        (helpdeskPlan?.amount ?? 0) /
            (helpdeskPlan?.num_quota_tickets ?? 1) /
            100,
        currency,
    )

    const earlyAccessPlanCostPerAutomatedConversation = formatAmount(
        1,
        currency,
    )
    const earlyAccessPlanExtraTicketCost = formatAmount(1.5, currency)
    const currentPlanPrice = formatAmount(
        (currentPlan?.amount ?? 0) / 100,
        currency,
    )

    const [isTermsChecked, setIsTermsChecked] = useState(false)

    return (
        <Modal
            preventCloseClickOutside
            isOpen={isOpen}
            onClose={onClose}
            classNameDialog={css.modalDialog}
            classNameContent={css.modalContent}
            size="large"
        >
            <ModalHeader
                title={
                    <h1>
                        Upgrade your AI Agent with new skills to drive more
                        sales
                    </h1>
                }
                subtitle={
                    <div>
                        <a
                            href="https://docs.gorgias.com/en-US/intro-to-ai-agent-for-sales-(beta)-1216108"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i className="material-icons">menu_book</i> Learn
                            more about Shopping Assistant
                        </a>
                    </div>
                }
                className={css.header}
            />
            <ModalBody className={css.body}>
                {!userIsAdmin && (
                    <Alert className={css.alert} type={AlertType.Warning} icon>
                        You do not have admin access. Contact your admin to
                        upgrade.
                    </Alert>
                )}
                <Card className={cn(css.card, css.earlyAccessPlanCard)}>
                    <CardHeader className={css.header}>
                        <CardTitle className={css.cardTitle}>
                            AI Agent with Support & Shopping Assistant Skills
                        </CardTitle>
                        <CardCaption
                            className={css.caption}
                            title="With Support Only"
                        >
                            Upon upgrading your AI Agent, a $1.00 fee applies
                            for each AI-driven automated interaction, plus a{' '}
                            {helpdeskPlanTicketCost} helpdesk fee.
                            <br />
                            Your current plan is {currentPlanPrice}/
                            {currentPlan?.cadence}.
                        </CardCaption>
                    </CardHeader>
                    <CardContent className={css.content}>
                        <div className={css.tips}>
                            <div className={css.tipTitle}>
                                <h3>
                                    <i className="material-icons">
                                        auto_awesome
                                    </i>
                                    <span>
                                        Increase your chat conversion rate and
                                        maximize revenue opportunities
                                    </span>
                                </h3>
                            </div>
                            <ul className={css.tipList}>
                                <li>
                                    <i className="material-icons">flare</i>
                                    <span>
                                        Acts as a 24/7 virtual shopping
                                        assistant, instantly answering pre-sales
                                        questions
                                    </span>
                                </li>
                                <li>
                                    <i className="material-icons">flare</i>
                                    <span>
                                        Delivers personalized product
                                        recommendations to drive upsells and
                                        cross-sells
                                    </span>
                                </li>
                                <li>
                                    <i className="material-icons">flare</i>
                                    <span>
                                        Uses dynamic discounts based on purchase
                                        intent without sacrificing margins
                                    </span>
                                </li>
                            </ul>
                        </div>

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
                                    <span className={css.skillName}>
                                        Shopping Assistant
                                    </span>
                                    <Badge className={css.badge} type="magenta">
                                        new
                                    </Badge>
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
                                    <span>
                                        {
                                            earlyAccessPlanCostPerAutomatedConversation
                                        }
                                    </span>{' '}
                                    per automated conversation
                                </div>
                                <div className={css.costItem}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            arrow_right
                                        </i>
                                    </span>
                                    <span>{helpdeskPlanTicketCost}</span> per
                                    Helpdesk ticket
                                </div>
                                <div className={css.costItem}>
                                    <span className={css.skillStatus}>
                                        <i className="material-icons">
                                            arrow_right
                                        </i>
                                    </span>
                                    <span>Overage:</span>{' '}
                                    {earlyAccessPlanExtraTicketCost}
                                </div>
                            </div>
                            <div className={cn(css.innerContent, css.newPrice)}>
                                <h3>New monthly pricing</h3>
                                <span className={css.price}>
                                    {isLoading ? (
                                        <Skeleton width={140} height={22} />
                                    ) : (
                                        <span>
                                            {price}/{earlyAccessPlan?.cadence}
                                        </span>
                                    )}
                                </span>
                                <span className={css.subPrice}>
                                    {isLoading ? (
                                        <Skeleton width={210} height={12} />
                                    ) : (
                                        `${earlyAccessPlan?.num_quota_tickets} automated tickets/months`
                                    )}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </ModalBody>
            <ModalFooter className={css.footer}>
                <Card className={cn(css.legalCard)}>
                    <CardContent>
                        <CheckBoxField
                            isDisabled={!userIsAdmin}
                            value={isTermsChecked}
                            onChange={setIsTermsChecked}
                            label={
                                <span className={css.checkboxLabel}>
                                    I agree to the updated pricing and terms
                                    associated with this upgrade, as outlined in{' '}
                                    <a
                                        href="https://www.gorgias.com/legal/terms-of-service"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Gorgias terms
                                    </a>
                                    .
                                </span>
                            }
                        />
                    </CardContent>
                </Card>

                <AIButton
                    onClick={onUpgradeClick}
                    isDisabled={!userIsAdmin || !isTermsChecked}
                    isLoading={isUpgrading}
                >
                    Upgrade AI Agent
                </AIButton>
                <div data-candu-id="ai-sales-agent-access-modal-sub-cta" />
            </ModalFooter>
        </Modal>
    )
}
