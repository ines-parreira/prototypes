import { getReferenceVisual } from '../../icons'
import { ReferenceCardError } from '../shared/ReferenceCardError'
import { SupportActionReferenceCardSkeleton } from './SupportActionReferenceCardSkeleton'
import { SupportActionReferenceCardView } from './SupportActionReferenceCardView'
import { useSupportActionReferenceData } from './useSupportActionReferenceData'

type Props = {
    workflowId: string
    isOpen: boolean
}

const VISUAL = getReferenceVisual('support-action')

export function SupportActionReferenceCard({ workflowId, isOpen }: Props) {
    const { configuration, isLoading, isError } = useSupportActionReferenceData(
        {
            workflowId,
            enabled: isOpen,
        },
    )

    if (isLoading) {
        return <SupportActionReferenceCardSkeleton />
    }

    if (isError || !configuration) {
        return (
            <ReferenceCardError
                icon={VISUAL.icon}
                typeLabel={VISUAL.label}
                message="Couldn't load this action."
            />
        )
    }

    return <SupportActionReferenceCardView configuration={configuration} />
}
