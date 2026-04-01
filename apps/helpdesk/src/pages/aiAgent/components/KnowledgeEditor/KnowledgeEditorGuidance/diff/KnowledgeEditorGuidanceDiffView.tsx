import { useMemo } from 'react'

import { diffWords } from 'diff'

import { Heading } from '@gorgias/axiom'

import { DiffReadOnlyEditor } from 'common/knowledge-editor/components/DiffReadOnlyEditor/DiffReadOnlyEditor'
import { computeUnifiedDiff } from 'common/knowledge-editor/components/DiffReadOnlyEditor/diffUtils'
import type { GuidanceVariableGroup } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { contentStateFromTextOrHTML } from 'utils/editor'

import css from './KnowledgeEditorGuidanceDiffView.less'

type Props = {
    oldTitle: string
    oldContent: string
    newTitle: string
    newContent: string
    availableVariables?: GuidanceVariableGroup[]
    availableActions?: GuidanceAction[]
}

export function KnowledgeEditorGuidanceDiffView({
    oldTitle,
    oldContent,
    newTitle,
    newContent,
    availableVariables,
    availableActions,
}: Props) {
    const titleDiff = useMemo(
        () => diffWords(oldTitle, newTitle),
        [oldTitle, newTitle],
    )

    const oldContentState = useMemo(
        () => contentStateFromTextOrHTML(undefined, oldContent),
        [oldContent],
    )

    const newContentState = useMemo(
        () => contentStateFromTextOrHTML(undefined, newContent),
        [newContent],
    )

    const { mergedContentState } = useMemo(
        () => computeUnifiedDiff(oldContentState, newContentState),
        [oldContentState, newContentState],
    )

    return (
        <div className={css.container}>
            <Heading size="lg">
                {titleDiff.map((part, index) => (
                    <span
                        key={index}
                        className={
                            part.added
                                ? css.added
                                : part.removed
                                  ? css.removed
                                  : undefined
                        }
                    >
                        {part.value}
                    </span>
                ))}
            </Heading>
            <div className={css.diffContent}>
                <DiffReadOnlyEditor
                    contentState={mergedContentState}
                    availableVariables={availableVariables}
                    availableActions={availableActions}
                />
            </div>
        </div>
    )
}
