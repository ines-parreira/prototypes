import type { Change } from 'diff'
import { diffWords } from 'diff'
import type { ContentState, DraftEntityMutability } from 'draft-js'
import {
    CharacterMetadata,
    ContentBlock,
    ContentState as ContentStateClass,
    genKey,
    Modifier,
    SelectionState,
} from 'draft-js'
import { List } from 'immutable'

import { draftjsGorgiasCustomBlockRenderers } from 'common/editor'
import { guidanceVariableRegex } from 'pages/common/draftjs/plugins/guidance-variables/constants'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

// Matches guidance variables ($$$...$$$) and actions (&&&...&&&) in plain text
const guidanceTokenRegex = /\$\$\$[^$]*\$\$\$|&&&[^&]*&&&/g
// SOH (Start of Heading) control character — used as an invisible word boundary
// so that diffWords treats each guidance token as a separate, atomic unit
const BOUNDARY = String.fromCharCode(1)
const boundaryCleanupRegex = new RegExp(BOUNDARY, 'g')
const FIRST_IMAGE_PLACEHOLDER_CODEPOINT = 0xe000
const IMAGE_ENTITY_TYPES = new Set([
    draftjsGorgiasCustomBlockRenderers.Img,
    'image',
    'IMAGE',
])

function isImageEntityType(type: string): boolean {
    return IMAGE_ENTITY_TYPES.has(type)
}

/**
 * Wraps diffWords to treat guidance tokens ($$$...$$$, &&&...&&&) as atomic units.
 *
 * Without this, diffWords would tokenize by whitespace and could split a token like
 * "$$$Customer: Email$$$" into separate diff parts, producing garbled output.
 *
 * Strategy:
 * 1. Replace each guidance token with a short placeholder (e.g. "GUIDANCETKN0X")
 *    wrapped in SOH boundary chars so diffWords sees it as an isolated word
 * 2. Run diffWords on the processed text
 * 3. Restore original tokens in the diff output
 *
 * Identical tokens in old/new get the same placeholder, so diffWords correctly
 * identifies them as unchanged.
 */
function diffWordsWithGuidanceTokens(
    oldText: string,
    newText: string,
): Change[] {
    const placeholderToToken = new Map<string, string>()
    const tokenToPlaceholder = new Map<string, string>()
    let counter = 0

    function getPlaceholder(token: string): string {
        const existing = tokenToPlaceholder.get(token)
        if (existing) return existing
        const placeholder = `GUIDANCETKN${counter++}X`
        placeholderToToken.set(placeholder, token)
        tokenToPlaceholder.set(token, placeholder)
        return placeholder
    }

    function replaceTokens(text: string): string {
        return text.replace(
            guidanceTokenRegex,
            (match) => `${BOUNDARY}${getPlaceholder(match)}${BOUNDARY}`,
        )
    }

    const oldProcessed = replaceTokens(oldText)
    const newProcessed = replaceTokens(newText)

    const diffs = diffWords(oldProcessed, newProcessed)

    // Restore original tokens and strip boundary chars from the diff output
    const placeholderRegex = /GUIDANCETKN\d+X/g
    for (const part of diffs) {
        part.value = part.value
            .replace(
                placeholderRegex,
                (match) => placeholderToToken.get(match) ?? match,
            )
            .replace(boundaryCleanupRegex, '')
    }

    return diffs
}

type ImageEntitySnapshot = {
    type: string
    mutability: DraftEntityMutability
    data: Record<string, unknown>
}

type CharInfo =
    | {
          isBlockBoundary: false
          style: ReturnType<ContentBlock['getInlineStyleAt']>
          blockType: string
          blockDepth: number
          imageEntity?: ImageEntitySnapshot
      }
    | {
          isBlockBoundary: true
          nextBlockType: string
          nextBlockDepth: number
      }

/**
 * Builds a flat charInfo array together with a diff input text.
 *
 * Image atomic entities are converted to unique one-char placeholders so they
 * can participate in textual diffing while preserving 1:1 positional mapping
 * with charInfos.
 */
function buildDiffInput(
    contentState: ContentState,
    imagePlaceholderBySignature: Map<string, string>,
): { diffText: string; charInfos: CharInfo[] } {
    const blocks = contentState.getBlocksAsArray()
    const charInfos: CharInfo[] = []
    let diffText = ''

    for (let b = 0; b < blocks.length; b++) {
        const block = blocks[b]
        const text = block.getText()
        const type = block.getType()
        const depth = block.getDepth()

        for (let i = 0; i < text.length; i++) {
            let outputChar = text[i]
            const entityKey = block.getEntityAt(i)
            let imageEntity: ImageEntitySnapshot | undefined

            if (entityKey) {
                const entity = contentState.getEntity(entityKey)
                if (isImageEntityType(entity.getType())) {
                    const snapshot: ImageEntitySnapshot = {
                        type: entity.getType(),
                        mutability: entity.getMutability(),
                        data: entity.getData() as Record<string, unknown>,
                    }
                    imageEntity = snapshot

                    const signature = JSON.stringify([
                        snapshot.type,
                        snapshot.data,
                    ])
                    let placeholder = imagePlaceholderBySignature.get(signature)
                    if (!placeholder) {
                        placeholder = String.fromCharCode(
                            FIRST_IMAGE_PLACEHOLDER_CODEPOINT +
                                imagePlaceholderBySignature.size,
                        )
                        imagePlaceholderBySignature.set(signature, placeholder)
                    }
                    outputChar = placeholder
                }
            }

            diffText += outputChar
            charInfos.push({
                isBlockBoundary: false,
                style: block.getInlineStyleAt(i),
                blockType: type,
                blockDepth: depth,
                imageEntity,
            })
        }

        if (b < blocks.length - 1) {
            diffText += '\n'
            charInfos.push({
                isBlockBoundary: true,
                nextBlockType: blocks[b + 1].getType(),
                nextBlockDepth: blocks[b + 1].getDepth(),
            })
        }
    }

    return { diffText, charInfos }
}

/**
 * Produces a single merged ContentState where added/removed text is interleaved
 * and tagged with DIFF_ADDED / DIFF_REMOVED inline styles.
 *
 * How it works:
 * 1. Build diff input text for both versions (including image placeholders)
 *    and diff it (word-level with token protection)
 * 2. Build parallel charInfo arrays from both ContentStates to preserve original
 *    inline styles, block types, and depths
 * 3. Walk the diff output char-by-char, pulling style info from the correct
 *    source (oldCharInfos for removed, newCharInfos for added/unchanged)
 *    and overlaying DIFF_ADDED/DIFF_REMOVED styles
 * 4. On '\n' chars, flush the current block and pick up the next block's type/depth
 * 5. Reapply image entities to merged content so atomic image blocks render
 *
 * The charInfo positions stay in sync with the diff output because
 * diffWordsWithGuidanceTokens restores original tokens (same length as input)
 * after diffing.
 */
export function computeUnifiedDiff(
    oldContentState: ContentState,
    newContentState: ContentState,
): {
    mergedContentState: ContentState
} {
    const imagePlaceholderBySignature = new Map<string, string>()
    const { diffText: oldDiffText, charInfos: oldCharInfos } = buildDiffInput(
        oldContentState,
        imagePlaceholderBySignature,
    )
    const { diffText: newDiffText, charInfos: newCharInfos } = buildDiffInput(
        newContentState,
        imagePlaceholderBySignature,
    )
    const diffs = diffWordsWithGuidanceTokens(oldDiffText, newDiffText)

    let oldPos = 0
    let newPos = 0

    type MergedBlock = {
        text: string
        charList: CharacterMetadata[]
        type: string
        depth: number
    }
    type PendingImageEntity = {
        blockIndex: number
        start: number
        end: number
        imageEntity: ImageEntitySnapshot
        diffStatus: DiffStatus
    }

    const mergedBlocks: MergedBlock[] = []
    const pendingImageEntities: PendingImageEntity[] = []
    let currentBlockText = ''
    let currentBlockChars: CharacterMetadata[] = []

    const firstNewBlock = newContentState.getBlocksAsArray()[0]
    const firstOldBlock = oldContentState.getBlocksAsArray()[0]
    const firstBlock = firstNewBlock ?? firstOldBlock
    let currentBlockType = firstBlock?.getType() ?? 'unstyled'
    let currentBlockDepth = firstBlock?.getDepth() ?? 0

    function flushCurrentBlock() {
        mergedBlocks.push({
            text: currentBlockText,
            charList: currentBlockChars,
            type: currentBlockType,
            depth: currentBlockDepth,
        })
        currentBlockText = ''
        currentBlockChars = []
    }

    for (const part of diffs) {
        for (let i = 0; i < part.value.length; i++) {
            const ch = part.value[i]

            if (ch === '\n') {
                flushCurrentBlock()

                let sourceInfo: CharInfo | undefined
                if (part.removed) {
                    sourceInfo = oldCharInfos[oldPos]
                    oldPos++
                } else if (part.added) {
                    sourceInfo = newCharInfos[newPos]
                    newPos++
                } else {
                    sourceInfo = newCharInfos[newPos]
                    oldPos++
                    newPos++
                }

                if (sourceInfo?.isBlockBoundary) {
                    currentBlockType = sourceInfo.nextBlockType
                    currentBlockDepth = sourceInfo.nextBlockDepth
                }

                continue
            }

            let info: CharInfo | undefined
            if (part.removed) {
                info = oldCharInfos[oldPos]
                oldPos++
            } else if (part.added) {
                info = newCharInfos[newPos]
                newPos++
            } else {
                info = newCharInfos[newPos]
                oldPos++
                newPos++
            }

            if (
                currentBlockChars.length === 0 &&
                info &&
                !info.isBlockBoundary
            ) {
                currentBlockType = info.blockType
                currentBlockDepth = info.blockDepth
            }

            if (
                info &&
                !info.isBlockBoundary &&
                info.blockType === 'atomic' &&
                currentBlockChars.length > 0
            ) {
                flushCurrentBlock()
                currentBlockType = info.blockType
                currentBlockDepth = info.blockDepth
            }

            let charMeta: CharacterMetadata
            if (info && !info.isBlockBoundary) {
                charMeta = CharacterMetadata.create({ style: info.style })
            } else {
                charMeta = CharacterMetadata.create()
            }

            if (part.added) {
                charMeta = CharacterMetadata.applyStyle(charMeta, 'DIFF_ADDED')
            } else if (part.removed) {
                charMeta = CharacterMetadata.applyStyle(
                    charMeta,
                    'DIFF_REMOVED',
                )
            }

            const isImagePlaceholder = !!(
                info &&
                !info.isBlockBoundary &&
                info.imageEntity
            )
            const charOffset = currentBlockChars.length
            currentBlockText += isImagePlaceholder ? ' ' : ch
            currentBlockChars.push(charMeta)

            if (
                isImagePlaceholder &&
                info &&
                !info.isBlockBoundary &&
                info.imageEntity
            ) {
                pendingImageEntities.push({
                    blockIndex: mergedBlocks.length,
                    start: charOffset,
                    end: charOffset + 1,
                    imageEntity: info.imageEntity,
                    diffStatus: part.added
                        ? 'added'
                        : part.removed
                          ? 'removed'
                          : null,
                })
            }
        }
    }

    flushCurrentBlock()

    const contentBlocks = mergedBlocks.map(
        (block) =>
            new ContentBlock({
                key: genKey(),
                type: block.type,
                text: block.text,
                characterList: List(block.charList),
                depth: block.depth,
            }),
    )

    let mergedContentState =
        ContentStateClass.createFromBlockArray(contentBlocks)

    const mergedBlockKeys = mergedContentState
        .getBlocksAsArray()
        .map((block) => block.getKey())

    for (const pendingEntity of pendingImageEntities) {
        mergedContentState = mergedContentState.createEntity(
            pendingEntity.imageEntity.type,
            pendingEntity.imageEntity.mutability,
            {
                ...pendingEntity.imageEntity.data,
                diffStatus: pendingEntity.diffStatus,
            },
        )
        const entityKey = mergedContentState.getLastCreatedEntityKey()
        const selection = SelectionState.createEmpty(
            mergedBlockKeys[pendingEntity.blockIndex],
        ).merge({
            anchorOffset: pendingEntity.start,
            focusOffset: pendingEntity.end,
        }) as SelectionState

        mergedContentState = Modifier.applyEntity(
            mergedContentState,
            selection,
            entityKey,
        )
    }

    return { mergedContentState }
}

export type DiffStatus = 'added' | 'removed' | null

/**
 * Checks whether all characters in a range share the same diff status.
 * Returns undefined if the status is mixed (e.g. part added, part unchanged),
 * which means the token can't be rendered as a single decorated tag — it falls
 * back to raw inline-styled text instead.
 */
function getConsistentDiffStatus(
    block: ContentBlock,
    start: number,
    end: number,
): DiffStatus | undefined {
    const firstStyle = block.getInlineStyleAt(start)
    const status: DiffStatus = firstStyle.has('DIFF_ADDED')
        ? 'added'
        : firstStyle.has('DIFF_REMOVED')
          ? 'removed'
          : null

    for (let i = start + 1; i < end; i++) {
        const style = block.getInlineStyleAt(i)
        const charStatus: DiffStatus = style.has('DIFF_ADDED')
            ? 'added'
            : style.has('DIFF_REMOVED')
              ? 'removed'
              : null
        if (charStatus !== status) return undefined
    }

    return status
}

/**
 * Scans the merged ContentState for guidance variable/action patterns and
 * attaches Draft.js entities with a diffStatus ('added' | 'removed' | null).
 *
 * These entities are picked up by the decorator plugins in DiffReadOnlyEditor
 * to render guidance tokens as styled tags (GuidanceVariableTag / GuidanceActionTag)
 * with diff border styling.
 *
 * Tokens with mixed diff status (some chars added, some not) are skipped —
 * they'll render as raw text with inline diff styling instead.
 */
export function addDiffEntities(contentState: ContentState): ContentState {
    const additions: Array<{
        blockKey: string
        start: number
        end: number
        entityType: string
        value: string
        diffStatus: DiffStatus
    }> = []

    contentState.getBlockMap().forEach((block, blockKey) => {
        if (!block || !blockKey) return
        const text = block.getText()

        const actionRegex = new RegExp(guidanceActionRegex.source, 'g')
        let match
        while ((match = actionRegex.exec(text)) !== null) {
            const start = match.index
            const end = start + match[0].length
            const diffStatus = getConsistentDiffStatus(block, start, end)
            if (diffStatus === undefined) continue

            additions.push({
                blockKey,
                start,
                end,
                entityType: 'guidance_action',
                value: match[0],
                diffStatus,
            })
        }

        const varRegex = new RegExp(guidanceVariableRegex.source, 'g')
        while ((match = varRegex.exec(text)) !== null) {
            const start = match.index
            const end = start + match[0].length
            const diffStatus = getConsistentDiffStatus(block, start, end)
            if (diffStatus === undefined) continue

            additions.push({
                blockKey,
                start,
                end,
                entityType: 'guidance_variable',
                value: match[0],
                diffStatus,
            })
        }
    })

    let state = contentState
    for (const addition of additions) {
        state = state.createEntity(addition.entityType, 'IMMUTABLE', {
            value: addition.value,
            diffStatus: addition.diffStatus,
        })
        const entityKey = state.getLastCreatedEntityKey()
        const selection = SelectionState.createEmpty(addition.blockKey).merge({
            anchorOffset: addition.start,
            focusOffset: addition.end,
        }) as SelectionState
        state = Modifier.applyEntity(state, selection, entityKey)
    }

    return state
}
