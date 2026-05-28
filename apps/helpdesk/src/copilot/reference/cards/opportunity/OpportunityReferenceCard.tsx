import { getReferenceVisual } from '../../icons'
import { ReferenceCardError } from '../shared/ReferenceCardError'
import { OpportunityReferenceCardSkeleton } from './OpportunityReferenceCardSkeleton'
import { OpportunityReferenceCardView } from './OpportunityReferenceCardView'
import { useOpportunityReferenceData } from './useOpportunityReferenceData'

type Props = {
    opportunityId: number
    shopName: string
    isOpen: boolean
}

const VISUAL = getReferenceVisual('opportunity')

export function OpportunityReferenceCard({
    opportunityId,
    shopName,
    isOpen,
}: Props) {
    const { opportunity, isLoading, isError } = useOpportunityReferenceData({
        shopName,
        opportunityId,
        enabled: isOpen,
    })

    if (isLoading) {
        return <OpportunityReferenceCardSkeleton />
    }

    if (isError || !opportunity) {
        return (
            <ReferenceCardError
                icon={VISUAL.icon}
                typeLabel={VISUAL.label}
                message="Couldn't load this opportunity."
            />
        )
    }

    return <OpportunityReferenceCardView opportunity={opportunity} />
}
