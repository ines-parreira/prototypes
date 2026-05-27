import type { GuidanceArticle } from 'pages/aiAgent/types'
import RelativeTime from 'pages/common/components/RelativeTime'

import { getReferenceVisual } from '../../icons'
import { getStatusTag } from '../article/status'
import {
    ReferenceCardRow,
    ReferenceCardShell,
} from '../shared/ReferenceCardShell'

const VISUAL = getReferenceVisual('skill')

export function SkillReferenceCardView({
    article,
}: {
    article: GuidanceArticle
}) {
    const intentCount = article.intents?.length ?? 0
    return (
        <ReferenceCardShell
            icon={VISUAL.icon}
            typeLabel={VISUAL.label}
            title={article.title}
            statusTag={getStatusTag(article)}
            rows={
                <>
                    <ReferenceCardRow icon="chat">
                        {intentCount === 0
                            ? 'No linked intents'
                            : `${intentCount} linked ${
                                  intentCount === 1 ? 'intent' : 'intents'
                              }`}
                    </ReferenceCardRow>
                    <ReferenceCardRow icon="clock">
                        Updated <RelativeTime datetime={article.lastUpdated} />
                    </ReferenceCardRow>
                </>
            }
        />
    )
}
