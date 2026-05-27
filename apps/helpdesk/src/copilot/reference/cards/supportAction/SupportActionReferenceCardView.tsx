import type { Paths } from 'rest_api/workflows_api/client.generated'

import RelativeTime from 'pages/common/components/RelativeTime'

import { getReferenceVisual } from '../../icons'
import {
    ReferenceCardRow,
    ReferenceCardShell,
} from '../shared/ReferenceCardShell'
import { getSupportActionStatusTag } from './status'

type WorkflowConfiguration = Paths.WfConfigurationControllerGet.Responses.$200

const VISUAL = getReferenceVisual('support-action')

type Props = {
    configuration: WorkflowConfiguration
}

export function SupportActionReferenceCardView({ configuration }: Props) {
    const description =
        configuration.short_description?.trim() ||
        configuration.description?.trim() ||
        null

    const updatedAt =
        configuration.updated_datetime ?? configuration.created_datetime

    return (
        <ReferenceCardShell
            icon={VISUAL.icon}
            typeLabel={VISUAL.label}
            title={configuration.name || 'Untitled action'}
            statusTag={getSupportActionStatusTag(configuration.is_draft)}
            body={description}
            rows={
                updatedAt ? (
                    <ReferenceCardRow icon="clock">
                        Updated <RelativeTime datetime={updatedAt} />
                    </ReferenceCardRow>
                ) : null
            }
        />
    )
}
