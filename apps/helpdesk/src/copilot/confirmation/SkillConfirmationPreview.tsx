import { useHistory } from 'react-router-dom'

import { ArtifactCard } from '@gorgias/copilot'
import type { SkillConfirmationPayload } from '@gorgias/copilot'

import { useGuidanceReferenceData } from '../reference/cards/article/useGuidanceReferenceData'
import { getReferenceVisual } from '../reference/icons'
import { resolveReferenceRoute } from '../reference/routes'

type Props = {
    payload: SkillConfirmationPayload
    onApprove: () => void
    onReject: () => void
    approveLabel: string
}

const VISUAL = getReferenceVisual('skill')

export function SkillConfirmationPreview({
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
        type: 'skill',
        id: payload.id,
        shopName: payload.shopName,
        shopType: payload.shopType,
    })

    return (
        <ArtifactCard
            label={VISUAL.label}
            icon={VISUAL.icon}
            title={article?.title ?? `Skill #${payload.id}`}
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
