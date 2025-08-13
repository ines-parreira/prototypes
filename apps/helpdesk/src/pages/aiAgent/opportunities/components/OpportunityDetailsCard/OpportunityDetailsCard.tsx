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
    const { typeText, defaultDescription } = useMemo(() => {
        switch (type) {
            case OpportunityType.RESOLVE_CONFLICT:
                return {
                    typeText: 'Resolve conflict',
                    defaultDescription:
                        'Review and edit your content to resolve this conflict: your Guidance “When a customer asks for a return or exhange” states that the return eligibility window is 14 days but your Return Policy articles says the return window is 30 days.',
                }
            case OpportunityType.FILL_KNOWLEDGE_GAP:
            default:
                return {
                    typeText: 'Fill knowledge gap',
                    defaultDescription:
                        'Review and approve this AI-generated Guidance based on your customers’ top asked questions. Note: you may already have an existing Guidance addressing this topic, double-check before saving.',
                }
        }
    }, [type])

    return (
        <div className={css.container}>
            <h3 className={css.title}>{typeText}</h3>
            <p className={css.description}>
                {description || defaultDescription}
            </p>
        </div>
    )
}
