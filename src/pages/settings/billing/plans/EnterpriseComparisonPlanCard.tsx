import React, {ComponentProps, MouseEvent, useState} from 'react'

import {hasLegacyPlan} from 'state/billing/selectors'
import {openChat} from 'utils'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'

import PlanCard, {PlanCardTheme} from './PlanCard'
import ChangePlanModal from './ChangePlanModal'
import TotalAmount from './TotalAmount'
import AutomationAmount from './AutomationAmount'
import {getEnterprisePlanCardFeatures} from './billingPlanFeatures'

import css from './BillingComparisonPlanCard.less'

type Props = {
    isUpdating: boolean
    defaultIsPlanChangeModalOpen?: boolean
    onPlanChange?: () => void
} & Omit<
    ComponentProps<typeof PlanCard>,
    'features' | 'footer' | 'headerBadge' | 'plan' | 'planName' | 'theme'
>

export default function EnterpriseComparisonPlanCard({
    className,
    isUpdating,
    defaultIsPlanChangeModalOpen = false,
    ...billingCardProps
}: Props) {
    const [isPlanChangeModalOpen, setIsPlanChangeModalOpen] = useState(
        defaultIsPlanChangeModalOpen
    )
    const isLegacyPlan = useAppSelector(hasLegacyPlan)

    const canChoosePlan = !isUpdating
    const switchPlanButtonText = 'Contact us'

    return (
        <PlanCard
            {...billingCardProps}
            className={className}
            planName="Enterprise"
            theme={PlanCardTheme.Gold}
            features={getEnterprisePlanCardFeatures()}
            price="Custom price"
            subHeader={
                <AutomationAmount
                    addOnAmount="Custom price"
                    plan={{id: 'enterprise'}}
                />
            }
            footer={
                <>
                    <TotalAmount
                        addOnAmount="Custom price"
                        plan={{id: 'enterprise'}}
                    />
                    <Button
                        aria-label={switchPlanButtonText}
                        className={css.footerButton}
                        intent={ButtonIntent.Text}
                        isLoading={isUpdating}
                        isDisabled={!canChoosePlan}
                        onClick={() => {
                            if (canChoosePlan) {
                                setIsPlanChangeModalOpen(!isPlanChangeModalOpen)
                            }
                        }}
                    >
                        {switchPlanButtonText}
                    </Button>
                    <ChangePlanModal
                        description={
                            <>
                                Our Enterprise plans are perfect for teams with
                                a large support volume.{' '}
                                <a
                                    href={`mailto:${window.GORGIAS_SUPPORT_EMAIL}`}
                                >
                                    <b>Get in touch</b>
                                </a>{' '}
                                with our experts to help find the best plan for
                                your company.
                            </>
                        }
                        header={
                            isLegacyPlan
                                ? 'Switch to our updated plans'
                                : "We're happy to see you grow 👏"
                        }
                        isOpen={isPlanChangeModalOpen}
                        isUpdating={isUpdating}
                        onClose={() => {
                            setIsPlanChangeModalOpen(false)
                        }}
                        onConfirm={(event: MouseEvent) => {
                            openChat(event)
                            setIsPlanChangeModalOpen(false)
                        }}
                        renderComparedPlan={({className, renderBody}) => (
                            <PlanCard
                                className={className}
                                planName="Enterprise"
                                theme={PlanCardTheme.Gold}
                                price="Custom price"
                                features={getEnterprisePlanCardFeatures()}
                                renderBody={renderBody}
                                footer={
                                    <>
                                        <AutomationAmount
                                            addOnAmount="Custom price"
                                            plan={{id: 'enterprise'}}
                                        />
                                        <TotalAmount
                                            addOnAmount="Custom price"
                                            plan={{id: 'enterprise'}}
                                        />
                                    </>
                                }
                            />
                        )}
                        confirmLabel="Get in touch"
                    />
                </>
            }
        />
    )
}
