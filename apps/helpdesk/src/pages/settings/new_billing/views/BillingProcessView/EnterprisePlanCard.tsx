import { logEvent, SegmentEvent } from '@repo/logging'

import { Button } from '@gorgias/axiom'

import Card from '../../components/Card'

import css from './BillingProcessView.less'

type EnterprisePlanCardProps = {
    messageForEnterprise: string
    setDefaultMessage: (msg: string) => void
    setIsModalOpen: (open: boolean) => void
}

export function EnterprisePlanCard({
    messageForEnterprise,
    setDefaultMessage,
    setIsModalOpen,
}: EnterprisePlanCardProps) {
    return (
        <Card title="Enterprise Plan">
            <div className={css.enterprisePlanText}>
                To subscribe to our Enterprise plan, please get in touch with
                our team.
            </div>
            <div className={css.enterprisePlanFooter}>
                <Button
                    onClick={() => {
                        logEvent(
                            SegmentEvent.BillingUsageAndPlansEnterprisePlanContactUsClicked,
                        )
                        setDefaultMessage(messageForEnterprise)
                        setIsModalOpen(true)
                    }}
                >
                    Contact Us
                </Button>
            </div>
        </Card>
    )
}
