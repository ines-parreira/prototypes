import { getReferenceVisual } from '../../icons'
import { ReferenceCardError } from '../shared/ReferenceCardError'
import { ReferenceCardSkeleton } from '../shared/ReferenceCardSkeleton'
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
        return (
            <ReferenceCardSkeleton
                icon={VISUAL.icon}
                typeLabel={VISUAL.label}
            />
        )
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
