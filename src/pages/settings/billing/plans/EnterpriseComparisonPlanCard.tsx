import React, {ComponentProps, MouseEvent, useState} from 'react'

import {getIsCurrentHelpdeskLegacy} from 'state/billing/selectors'
import {openChat} from 'utils'
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'

import PlanCard, {PlanCardTheme} from './PlanCard'
import ChangePlanModal from './ChangePlanModal'
import TotalAmount from './TotalAmount'
import AutomationAmount from './AutomationAmount'
import {getEnterprisePlanCardFeatures} from './billingPlanFeatures'

import css from './BillingComparisonPlanCard.less'

type Props = {
    isUpdating: boolean
    defaultIsPriceChangeModalOpen?: boolean
    onPriceChange?: () => void
} & Omit<
    ComponentProps<typeof PlanCard>,
    'features' | 'footer' | 'headerBadge' | 'planName' | 'theme'
>

export default function EnterpriseComparisonPlanCard({
    className,
    isUpdating,
    defaultIsPriceChangeModalOpen = false,
    ...billingCardProps
}: Props) {
    const [isPriceChangeModalOpen, setIsPriceChangeModalOpen] = useState(
        defaultIsPriceChangeModalOpen
    )
    const isCurrentHelpdeskLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)

    const canChoosePrice = !isUpdating
    const switchPriceButtonText = 'Contact us'

    return (
        <PlanCard
            {...billingCardProps}
            className={className}
            planName="Enterprise"
            theme={PlanCardTheme.Gold}
            features={getEnterprisePlanCardFeatures()}
            price="Custom price"
            subHeader={
                <AutomationAmount addOnAmount="Custom price" editable={false} />
            }
            footer={
                <>
                    <TotalAmount addOnAmount="Custom price" />
                    <Button
                        aria-label={switchPriceButtonText}
                        className={css.footerButton}
                        fillStyle="ghost"
                        isLoading={isUpdating}
                        isDisabled={!canChoosePrice}
                        onClick={() => {
                            if (canChoosePrice) {
                                setIsPriceChangeModalOpen(
                                    !isPriceChangeModalOpen
                                )
                            }
                        }}
                    >
                        {switchPriceButtonText}
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
                            isCurrentHelpdeskLegacy
                                ? 'Switch to our updated plans'
                                : "We're happy to see you grow 👏"
                        }
                        isOpen={isPriceChangeModalOpen}
                        isUpdating={isUpdating}
                        onClose={() => {
                            setIsPriceChangeModalOpen(false)
                        }}
                        onConfirm={(event: MouseEvent) => {
                            openChat(event)
                            setIsPriceChangeModalOpen(false)
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
                                            editable={false}
                                        />
                                        <TotalAmount addOnAmount="Custom price" />
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
