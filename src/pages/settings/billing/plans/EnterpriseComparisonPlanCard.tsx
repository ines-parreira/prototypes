import React, {useState, ComponentProps, MouseEvent} from 'react'
import {Button} from 'reactstrap'
import {useSelector} from 'react-redux'
import classNames from 'classnames'

import {
    getCurrentPlan,
    hasLegacyPlan,
} from '../../../../state/billing/selectors'
import {openChat} from '../../../../utils'

import BillingPlanCard from './BillingPlanCard'
import PlanCard, {PlanCardTheme} from './PlanCard'
import ChangePlanModal from './ChangePlanModal'
import {getEnterprisePlanCardFeatures} from './billingPlanFeatures'

type Props = {
    isUpdating: boolean
    defaultIsPlanChangeModalOpen?: boolean
    onPlanChange?: () => void
} & Omit<
    ComponentProps<typeof BillingPlanCard>,
    'footer' | 'headerBadge' | 'theme' | 'plan'
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
    const currentPlan = useSelector(getCurrentPlan)
    const isLegacyPlan = useSelector(hasLegacyPlan)

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
            footer={
                <>
                    <Button
                        aria-label={switchPlanButtonText}
                        className={classNames({
                            'btn-loading': isUpdating,
                        })}
                        color="link"
                        disabled={!canChoosePlan}
                        onClick={() => {
                            if (canChoosePlan) {
                                setIsPlanChangeModalOpen(!isPlanChangeModalOpen)
                            }
                        }}
                    >
                        {switchPlanButtonText}
                    </Button>
                    <ChangePlanModal
                        currentPlan={currentPlan}
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
                            />
                        )}
                        confirmLabel="Get in touch"
                    />
                </>
            }
        />
    )
}
