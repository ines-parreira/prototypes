import type { ReactNode } from 'react'

import type { GuidanceArticle } from 'pages/aiAgent/types'
import RelativeTime from 'pages/common/components/RelativeTime'

import { getReferenceVisual } from '../../icons'
import { getStatusTag } from '../article/status'
import {
    ReferenceCardRow,
    ReferenceCardShell,
} from '../shared/ReferenceCardShell'

const VISUAL = getReferenceVisual('guidance')

type Props = {
    article: GuidanceArticle
    /**
     * Pre-rendered body preview — typically a mix of plain text and inline
     * action/variable pills produced by `renderGuidanceContent`. Same
     * placeholders, same labels, same data the editor uses.
     */
    body?: ReactNode
}

export function GuidanceReferenceCardView({ article, body }: Props) {
    const intentCount = article.intents?.length ?? 0
    return (
        <ReferenceCardShell
            icon={VISUAL.icon}
            typeLabel={VISUAL.label}
            title={article.title}
            statusTag={getStatusTag(article)}
            body={body}
            rows={
                <>
                    <ReferenceCardRow icon="clock">
                        Updated <RelativeTime datetime={article.lastUpdated} />
                    </ReferenceCardRow>
                    {intentCount > 0 ? (
                        <ReferenceCardRow icon="chat">
                            {intentCount} linked{' '}
                            {intentCount === 1 ? 'intent' : 'intents'}
                        </ReferenceCardRow>
                    ) : null}
                </>
            }
        />
    )
}
