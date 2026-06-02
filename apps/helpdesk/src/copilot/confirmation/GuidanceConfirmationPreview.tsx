import { useHistory } from 'react-router-dom'

import { ArtifactCard } from '@gorgias/copilot'
import type { GuidanceConfirmationPayload } from '@gorgias/copilot'

import { useGuidanceReferenceData } from '../reference/cards/article/useGuidanceReferenceData'
import { getReferenceVisual } from '../reference/icons'
import { resolveReferenceRoute } from '../reference/routes'

type Props = {
    payload: GuidanceConfirmationPayload
    onApprove: () => void
    onReject: () => void
    approveLabel: string
}

const VISUAL = getReferenceVisual('guidance')

export function GuidanceConfirmationPreview({
    payload,
    onApprove,
    onReject,
    approveLabel,
}: Props) {
    const history = useHistory()
    const { article } = useGuidanceReferenceData({
        shopName: payload.shopName,
        articleId: payload.id,
        enabled: true,
    })

    const previewRoute = resolveReferenceRoute({
        type: 'guidance',
        id: payload.id,
        shopName: payload.shopName,
        shopType: payload.shopType,
    })

    return (
        <ArtifactCard
            label={VISUAL.label}
            icon={VISUAL.icon}
            title={article?.title ?? `Guidance #${payload.id}`}
            actionLabel={previewRoute ? 'Preview' : undefined}
            onAction={
                previewRoute ? () => history.push(previewRoute) : undefined
            }
            actions={[
                {
                    label: approveLabel,
                    variant: 'primary',
                    onClick: onApprove,
                },
                {
                    label: 'Reject',
                    variant: 'tertiary',
                    onClick: onReject,
                },
            ]}
        />
    )
}
