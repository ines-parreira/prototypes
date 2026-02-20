import { useMemo } from 'react'

import { Heading } from '@gorgias/axiom'

import { textLimit } from 'pages/aiAgent/components/GuidanceEditor/guidanceTextContent.utils'
import type { GuidanceVariableGroup } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import RichField from 'pages/common/forms/RichField/RichField'

import css from './KnowledgeEditorGuidanceReadView.less'

type Props = {
    content: string
    title: string
    availableActions?: GuidanceAction[]
    availableVariables?: GuidanceVariableGroup[]
}

export const KnowledgeEditorGuidanceReadView = ({
    content,
    title,
    availableActions,
    availableVariables,
}: Props) => {
    const richFieldValue = useMemo(
        () => ({
            html: content,
            text: content,
        }),
        [content],
    )

    return (
        <div className={css.container}>
            <Heading size="lg">{title}</Heading>
            <ToolbarProvider
                canAddProductCard={true}
                canAddDiscountCodeLink={false}
                canAddVideoPlayer={false}
                guidanceVariables={availableVariables}
                guidanceActions={availableActions}
            >
                <RichField
                    key={content}
                    minHeight={320}
                    maxLength={textLimit}
                    value={richFieldValue}
                    allowExternalChanges
                    displayOnly
                    onChange={() => {}}
                    displayedActions={[
                        ActionName.Bold,
                        ActionName.Italic,
                        ActionName.Underline,
                        ActionName.Link,
                        ActionName.Emoji,
                        ActionName.GuidanceVariable,
                        ActionName.GuidanceAction,
                        ActionName.BulletedList,
                        ActionName.OrderedList,
                    ]}
                    noAutoScroll
                    getGuidanceVariables={() => availableVariables || []}
                />
            </ToolbarProvider>
        </div>
    )
}
