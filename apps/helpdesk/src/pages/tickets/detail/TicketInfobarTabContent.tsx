import type { ComponentProps } from 'react'

import { TicketInfobarTab } from '@repo/navigation'

import TicketFeedback from 'pages/tickets/detail/components/TicketFeedback'

import { AutoQAInfobarPanel } from './AutoQAInfobarPanel'
import { TicketCustomerSections } from './TicketCustomerSections/TicketCustomerSections'

import css from './TicketInfobarContainer.less'

type TicketInfobarTabContentProps = {
    activeTab: TicketInfobarTab
    hasAIAgent: boolean
    canAccessAIFeedback: boolean
    feedbackKey: number
    customerSectionsProps: ComponentProps<typeof TicketCustomerSections>
}

export const TicketInfobarTabContent = ({
    activeTab,
    hasAIAgent,
    canAccessAIFeedback,
    feedbackKey,
    customerSectionsProps,
}: TicketInfobarTabContentProps) => {
    const showAIFeedback =
        activeTab === TicketInfobarTab.AIFeedback &&
        hasAIAgent &&
        canAccessAIFeedback
    const showAutoQA = activeTab === TicketInfobarTab.AutoQA
    const showCustomerSections = !showAIFeedback && !showAutoQA

    return (
        <>
            {showAIFeedback && <TicketFeedback key={feedbackKey} />}
            {showAutoQA && <AutoQAInfobarPanel />}
            <div
                hidden={!showCustomerSections}
                className={css.alwaysMountedCustomerSections}
            >
                <TicketCustomerSections {...customerSectionsProps} />
            </div>
        </>
    )
}
