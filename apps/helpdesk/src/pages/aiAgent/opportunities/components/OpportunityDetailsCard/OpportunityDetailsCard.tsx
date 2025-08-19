import { useMemo } from 'react'

import { OpportunityType } from '../../enums'

import css from './OpportunityDetailsCard.less'

interface OpportunityDetailsCardProps {
    type: OpportunityType
    title: string
    description?: string
}

export const OpportunityDetailsCard = ({
    type,
    description,
}: OpportunityDetailsCardProps) => {
    const { defaultDescription } = useMemo(() => {
        switch (type) {
            case OpportunityType.RESOLVE_CONFLICT:
                return {
                    defaultDescription:
                        'Review and approve this AI-generated Guidance based on your customers’ top asked questions to improve AI Agent’s performance.',
                }
            case OpportunityType.FILL_KNOWLEDGE_GAP:
            default:
                return {
                    defaultDescription:
                        'Review and approve this AI-generated Guidance based on your customers’ top asked questions to improve AI Agent’s performance. Note: you may already have an existing Guidance addressing this topic.',
                }
        }
    }, [type])

    return (
        <div className={css.container}>
            <h3 className={css.title}>Opportunity</h3>
            <p className={css.description}>
                {description || defaultDescription}
            </p>
        </div>
    )
}
