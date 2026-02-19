import { useCallback, useMemo, useRef, useState } from 'react'

import classNames from 'classnames'
import type { ContentBlock, ContentState as ContentStateType } from 'draft-js'
import { EditorState } from 'draft-js'
import Editor from 'draft-js-plugins-editor'

import { draftjsGorgiasCustomBlockRenderers } from 'common/editor'
import type { GuidanceVariableGroup } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import GuidanceVariableTag from 'pages/common/draftjs/plugins/guidance-variables/GuidanceVariableTag'
import GuidanceActionTag from 'pages/common/draftjs/plugins/guidanceActions/GuidanceActionTag'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import type {
    DecoratorComponentProps,
    DecoratorStrategyCallback,
} from 'pages/common/draftjs/plugins/types'
import { replaceAttachmentURL } from 'utils'

import type { DiffStatus } from './diffUtils'
import { addDiffEntities } from './diffUtils'

import 'draft-js/dist/Draft.css'

import css from './DiffReadOnlyEditor.less'

// Inline styles applied by Draft.js customStyleMap for diff-highlighted plain text.
// Guidance tokens (variables/actions) use a different path — they're rendered as
// decorated tag components with border styling via CSS (see DiffReadOnlyEditor.less).
const DIFF_STYLE_MAP: Record<string, React.CSSProperties> = {
    DIFF_ADDED: {
        backgroundColor: 'var(--surface-success-primary)',
        color: 'var(--content-success-primary)',
    },
    DIFF_REMOVED: {
        backgroundColor: 'var(--surface-error-secondary)',
        color: 'var(--content-error-primary)',
        textDecoration: 'line-through',
    },
}

type DiffImageBlockProps = {
    block: ContentBlock
    contentState: ContentStateType
}
const IMAGE_ENTITY_TYPES = new Set([
    draftjsGorgiasCustomBlockRenderers.Img,
    'image',
    'IMAGE',
])

function isImageEntityType(type: string): boolean {
    return IMAGE_ENTITY_TYPES.has(type)
}

function getDiffStatusFromBlock(block: ContentBlock): DiffStatus {
    const style = block.getInlineStyleAt(0)
    if (style.has('DIFF_ADDED')) return 'added'
    if (style.has('DIFF_REMOVED')) return 'removed'
    return null
}

function DiffImageBlock({ block, contentState }: DiffImageBlockProps) {
    const entityKey = block.getEntityAt(0)
    if (!entityKey) return null

    const entity = contentState.getEntity(entityKey)
    const data = entity.getData() as {
        src?: string
        url?: string
        diffStatus?: DiffStatus
    }
    const diffStatus = data.diffStatus ?? getDiffStatusFromBlock(block)
    const imageSrc = data.src ?? data.url ?? ''
    const label =
        diffStatus === 'added'
            ? 'Added image'
            : diffStatus === 'removed'
              ? 'Removed image'
              : null

    return (
        <figure
            className={classNames(css.imageWrapper, {
                [css.imageWrapperAdded]: diffStatus === 'added',
                [css.imageWrapperRemoved]: diffStatus === 'removed',
            })}
        >
            {imageSrc ? (
                <img
                    src={replaceAttachmentURL(imageSrc)}
                    alt=""
                    role="presentation"
                    className={css.image}
                />
            ) : (
                <div className={css.imagePlaceholder}>Image unavailable</div>
            )}
            {label ? (
                <figcaption className={css.imageDiffLabel}>{label}</figcaption>
            ) : null}
        </figure>
    )
}

function getEffectiveListStyle(block: ContentBlock): 'ordered' | 'unordered' {
    const visualListStyle = block.getData?.()?.get?.('visualListStyle') as
        | string
        | undefined

    if (visualListStyle === 'ordered') return 'ordered'
    if (visualListStyle === 'unordered') return 'unordered'
    return block.getType() === 'ordered-list-item' ? 'ordered' : 'unordered'
}

function isListBlock(block: ContentBlock): boolean {
    const type = block.getType()
    return type === 'ordered-list-item' || type === 'unordered-list-item'
}

function isFullyRemovedBlock(block: ContentBlock): boolean {
    const text = block.getText()
    if (!text.length) return false

    for (let i = 0; i < text.length; i++) {
        const style = block.getInlineStyleAt(i)
        if (!style.has('DIFF_REMOVED') || style.has('DIFF_ADDED')) {
            return false
        }
    }

    return true
}

function isFullyAddedBlock(block: ContentBlock): boolean {
    const text = block.getText()
    if (!text.length) return false

    for (let i = 0; i < text.length; i++) {
        const style = block.getInlineStyleAt(i)
        if (!style.has('DIFF_ADDED') || style.has('DIFF_REMOVED')) {
            return false
        }
    }

    return true
}

function isTransparentBlockForListFlow(block: ContentBlock): boolean {
    return !isListBlock(block) && isFullyRemovedBlock(block)
}

function isWhitespaceOnlyBreakDiffBlock(block: ContentBlock): boolean {
    if (block.getType() !== 'unstyled') {
        return false
    }

    if (
        block
            .getText()
            .replace(/\u00A0/g, ' ')
            .trim() !== ''
    ) {
        return false
    }

    return isFullyAddedBlock(block) || isFullyRemovedBlock(block)
}

function getPreviousRelevantBlock(
    contentState: ContentStateType,
    blockKey: string,
): ContentBlock | undefined {
    let previous = contentState.getBlockBefore(blockKey)
    while (previous && isTransparentBlockForListFlow(previous)) {
        previous = contentState.getBlockBefore(previous.getKey())
    }

    return previous
}

function findChainContext(
    contentState: ContentStateType,
    block: ContentBlock,
    depth: number,
    effectiveStyle: 'ordered' | 'unordered',
): { chainStart: ContentBlock; hasStyleBreak: boolean } {
    let chainStart = block
    let prev = contentState.getBlockBefore(block.getKey())
    while (prev) {
        if (isTransparentBlockForListFlow(prev)) {
            prev = contentState.getBlockBefore(prev.getKey())
            continue
        }

        if (prev.getDepth() > depth) {
            prev = contentState.getBlockBefore(prev.getKey())
            continue
        }
        if (prev.getDepth() < depth) break
        if (
            !isListBlock(prev) ||
            getEffectiveListStyle(prev) !== effectiveStyle
        )
            break

        chainStart = prev
        prev = contentState.getBlockBefore(prev.getKey())
    }

    let chainPrev = contentState.getBlockBefore(chainStart.getKey())
    while (chainPrev) {
        if (isTransparentBlockForListFlow(chainPrev)) {
            chainPrev = contentState.getBlockBefore(chainPrev.getKey())
            continue
        }
        if (chainPrev.getDepth() <= depth) break
        chainPrev = contentState.getBlockBefore(chainPrev.getKey())
    }

    const hasStyleBreak =
        !!chainPrev &&
        chainPrev.getDepth() === depth &&
        isListBlock(chainPrev) &&
        getEffectiveListStyle(chainPrev) !== effectiveStyle

    return { chainStart, hasStyleBreak }
}

function getStyleNestingLevel(
    contentState: ContentStateType,
    block: ContentBlock,
    effectiveStyle: 'ordered' | 'unordered',
): number {
    const depth = block.getDepth()
    if (depth === 0) return 0

    const { chainStart, hasStyleBreak } = findChainContext(
        contentState,
        block,
        depth,
        effectiveStyle,
    )
    if (hasStyleBreak) return 0

    let nestingLevel = 0
    let targetDepth = depth - 1
    let walkFrom = contentState.getBlockBefore(chainStart.getKey())

    while (walkFrom && targetDepth >= 0) {
        if (isTransparentBlockForListFlow(walkFrom)) {
            walkFrom = contentState.getBlockBefore(walkFrom.getKey())
            continue
        }

        if (walkFrom.getDepth() > targetDepth) {
            walkFrom = contentState.getBlockBefore(walkFrom.getKey())
            continue
        }
        if (walkFrom.getDepth() < targetDepth) break
        if (!isListBlock(walkFrom)) break
        if (getEffectiveListStyle(walkFrom) !== effectiveStyle) break

        const ancestorContext = findChainContext(
            contentState,
            walkFrom,
            targetDepth,
            effectiveStyle,
        )

        nestingLevel++
        if (ancestorContext.hasStyleBreak) break

        targetDepth--
        walkFrom = contentState.getBlockBefore(
            ancestorContext.chainStart.getKey(),
        )
    }

    return nestingLevel
}

function getNearestAncestorAtDepth(
    contentState: ContentStateType,
    block: ContentBlock,
    targetDepth: number,
): ContentBlock | undefined {
    let cursor = contentState.getBlockBefore(block.getKey())
    while (cursor) {
        if (isTransparentBlockForListFlow(cursor)) {
            cursor = contentState.getBlockBefore(cursor.getKey())
            continue
        }

        const cursorDepth = cursor.getDepth()
        if (cursorDepth === targetDepth) {
            return cursor
        }
        cursor = contentState.getBlockBefore(cursor.getKey())
    }

    return undefined
}

// Decorator components wrap guidance tokens in a span with diff styling.
// The diffStatus is attached as entity data by addDiffEntities in diffUtils.ts.
function DiffActionDecorator(props: DecoratorComponentProps) {
    const { contentState, entityKey, children } = props
    const data = contentState.getEntity(entityKey).getData() as {
        value: string
        diffStatus: DiffStatus
    }

    return (
        <span
            className={classNames({
                [css.tagDiffAdded]: data.diffStatus === 'added',
                [css.tagDiffRemoved]: data.diffStatus === 'removed',
            })}
        >
            <GuidanceActionTag value={data.value}>{children}</GuidanceActionTag>
        </span>
    )
}

function DiffVariableDecorator(props: DecoratorComponentProps) {
    const { contentState, entityKey, children } = props
    const data = contentState.getEntity(entityKey).getData() as {
        value: string
        diffStatus: DiffStatus
    }

    return (
        <span
            className={classNames({
                [css.tagDiffAdded]: data.diffStatus === 'added',
                [css.tagDiffRemoved]: data.diffStatus === 'removed',
            })}
        >
            <GuidanceVariableTag value={data.value}>
                {children}
            </GuidanceVariableTag>
        </span>
    )
}

function createDiffPlugins() {
    return [
        {
            decorators: [
                {
                    strategy: (
                        contentBlock: ContentBlock,
                        callback: DecoratorStrategyCallback,
                        contentState: ContentStateType,
                    ) => {
                        contentBlock.findEntityRanges((character) => {
                            const entityKey = character.getEntity()
                            return (
                                entityKey !== null &&
                                contentState.getEntity(entityKey).getType() ===
                                    'guidance_action'
                            )
                        }, callback)
                    },
                    component: DiffActionDecorator,
                },
            ],
        },
        {
            decorators: [
                {
                    strategy: (
                        contentBlock: ContentBlock,
                        callback: DecoratorStrategyCallback,
                        contentState: ContentStateType,
                    ) => {
                        contentBlock.findEntityRanges((character) => {
                            const entityKey = character.getEntity()
                            return (
                                entityKey !== null &&
                                contentState.getEntity(entityKey).getType() ===
                                    'guidance_variable'
                            )
                        }, callback)
                    },
                    component: DiffVariableDecorator,
                },
            ],
        },
        {
            blockRendererFn: (
                block: ContentBlock,
                {
                    getEditorState,
                }: {
                    getEditorState: () => EditorState
                },
            ) => {
                if (block.getType() !== 'atomic') return null
                const entityKey = block.getEntityAt(0)
                if (!entityKey) return null

                const contentState = getEditorState().getCurrentContent()
                const entity = contentState.getEntity(entityKey)
                if (!isImageEntityType(entity.getType())) {
                    return null
                }

                return {
                    component: DiffImageBlock,
                    editable: false,
                }
            },
        },
    ]
}

type Props = {
    contentState: ContentStateType
    availableVariables?: GuidanceVariableGroup[]
    availableActions?: GuidanceAction[]
}

export function DiffReadOnlyEditor({
    contentState,
    availableVariables,
    availableActions,
}: Props) {
    const editorRef = useRef<Editor | null>(null)

    const plugins = useMemo(() => createDiffPlugins(), [])

    // addDiffEntities scans for guidance token patterns in the merged ContentState
    // and attaches entity metadata so the decorator plugins above can render them
    // as styled tag components instead of raw text
    const [editorState, setEditorState] = useState(() => {
        const enrichedContentState = addDiffEntities(contentState)
        return EditorState.createWithContent(enrichedContentState)
    })

    const onChange = useCallback((newState: EditorState) => {
        setEditorState(newState)
    }, [])

    const blockStyleFn = useCallback(
        (block: ContentBlock): string => {
            const type = block.getType()
            const classes: string[] = []

            const isOrderedList = type === 'ordered-list-item'
            const isUnorderedList = type === 'unordered-list-item'

            if (isOrderedList || isUnorderedList) {
                const depth = block.getDepth()
                const effectiveStyle = getEffectiveListStyle(block)

                classes.push(css.listItem)
                classes.push(
                    effectiveStyle === 'ordered'
                        ? css.listOrdered
                        : css.listUnordered,
                )

                const depthClass = css[`listDepth${depth}` as keyof typeof css]
                if (depthClass) classes.push(depthClass)

                const contentState = editorState.getCurrentContent()

                const nestingLevel = getStyleNestingLevel(
                    contentState,
                    block,
                    effectiveStyle,
                )
                const markerClass =
                    css[`markerStyle${nestingLevel % 3}` as keyof typeof css]
                if (markerClass) classes.push(markerClass)

                const blockBefore = getPreviousRelevantBlock(
                    contentState,
                    block.getKey(),
                )

                const shouldReset = (() => {
                    if (!blockBefore) return true

                    const prevType = blockBefore.getType()
                    const isPrevList =
                        prevType === 'ordered-list-item' ||
                        prevType === 'unordered-list-item'
                    if (!isPrevList) return true

                    const prevDepth = blockBefore.getDepth()
                    if (prevDepth < depth) return true
                    if (prevDepth > depth) return false

                    if (depth > 0) {
                        const currentParent = getNearestAncestorAtDepth(
                            contentState,
                            block,
                            depth - 1,
                        )
                        const previousParent = getNearestAncestorAtDepth(
                            contentState,
                            blockBefore,
                            depth - 1,
                        )

                        if (
                            currentParent?.getKey() !== previousParent?.getKey()
                        ) {
                            return true
                        }
                    }

                    return getEffectiveListStyle(blockBefore) !== effectiveStyle
                })()

                if (shouldReset) {
                    const resetClass =
                        css[`listResetDepth${depth}` as keyof typeof css]
                    if (resetClass) classes.push(resetClass)
                }
            } else {
                const depth = block.getDepth()
                if (depth > 0) {
                    const depthClass =
                        css[`blockDepth${depth}` as keyof typeof css]
                    if (depthClass) classes.push(depthClass)
                }

                if (isWhitespaceOnlyBreakDiffBlock(block)) {
                    classes.push(css.diffBreakBlock)

                    if (isFullyAddedBlock(block)) {
                        classes.push(css.diffBreakBlockAdded)
                    } else if (isFullyRemovedBlock(block)) {
                        classes.push(css.diffBreakBlockRemoved)
                    }
                }
            }

            return classes.filter(Boolean).join(' ')
        },
        [editorState],
    )

    return (
        <ToolbarProvider
            guidanceVariables={availableVariables}
            guidanceActions={availableActions}
        >
            <Editor
                ref={(el: Editor | null) => {
                    editorRef.current = el
                }}
                editorState={editorState}
                // theory says that this isn't needed for view only, BUT it doesn't render the custom elements otherwise
                onChange={onChange}
                plugins={plugins}
                customStyleMap={DIFF_STYLE_MAP}
                blockStyleFn={blockStyleFn}
                readOnly
            />
        </ToolbarProvider>
    )
}
