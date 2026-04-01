import type { Change } from 'diff'
import { diffArrays, diffWords } from 'diff'
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
const nonBmpCharRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
// SOH (Start of Heading) control character — used as an invisible word boundary
// so that diffWords treats each guidance token as a separate, atomic unit
const BOUNDARY = String.fromCharCode(1)
const boundaryCleanupRegex = new RegExp(BOUNDARY, 'g')
const IMAGE_ENTITY_TYPES = new Set([
    draftjsGorgiasCustomBlockRenderers.Img,
    'image',
    'IMAGE',
])

type ImageEntitySnapshot = {
    type: string
    mutability: DraftEntityMutability
    data: Record<string, unknown>
}

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
        const placeholder = `GUIDANCEATOM${counter++}X`
        placeholderToToken.set(placeholder, token)
        tokenToPlaceholder.set(token, placeholder)
        return placeholder
    }

    function replaceTokens(text: string): string {
        const withGuidanceTokens = text.replace(
            guidanceTokenRegex,
            (match) => `${BOUNDARY}${getPlaceholder(match)}${BOUNDARY}`,
        )

        return withGuidanceTokens.replace(
            nonBmpCharRegex,
            (match) => `${BOUNDARY}${getPlaceholder(match)}${BOUNDARY}`,
        )
    }

    const oldProcessed = replaceTokens(oldText)
    const newProcessed = replaceTokens(newText)

    const diffs = diffWords(oldProcessed, newProcessed)

    // Restore original tokens and strip boundary chars from the diff output
    const placeholderRegex = /GUIDANCEATOM\d+X/g
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

type MergedBlock = {
    text: string
    charList: CharacterMetadata[]
    type: string
    depth: number
    data?: ReturnType<ContentBlock['getData']>
    imageEntity?: ImageEntitySnapshot
    imageDiffStatus?: DiffStatus
}

const LIST_MARKER_PREFIX_REGEX = /^\s*(?:[-*•]\s+|\d+[.)]\s+|[a-z][.)]\s+)/i

function getImageEntitySnapshot(
    contentState: ContentState,
    block: ContentBlock,
): ImageEntitySnapshot | undefined {
    for (let i = 0; i < block.getLength(); i++) {
        const entityKey = block.getEntityAt(i)
        if (!entityKey) continue

        const entity = contentState.getEntity(entityKey)
        if (!isImageEntityType(entity.getType())) continue

        return {
            type: entity.getType(),
            mutability: entity.getMutability(),
            data: entity.getData() as Record<string, unknown>,
        }
    }

    return undefined
}

function getImageEntitySignature(
    imageEntity: ImageEntitySnapshot | undefined,
): string {
    if (!imageEntity) return ''

    return JSON.stringify([imageEntity.type, imageEntity.data])
}

function isIgnorableEmptyBlock(
    block: ContentBlock,
    imageEntity: ImageEntitySnapshot | undefined,
): boolean {
    return (
        !imageEntity && block.getType() === 'unstyled' && block.getText() === ''
    )
}

function applyDiffStyle(
    charMeta: CharacterMetadata,
    status: 'added' | 'removed' | null,
): CharacterMetadata {
    if (status === 'added') {
        return CharacterMetadata.applyStyle(charMeta, 'DIFF_ADDED')
    }
    if (status === 'removed') {
        return CharacterMetadata.applyStyle(charMeta, 'DIFF_REMOVED')
    }
    return charMeta
}

function styleWholeBlock(
    sourceBlock: ContentBlock,
    status: 'added' | 'removed' | null,
    imageEntity?: ImageEntitySnapshot,
): MergedBlock {
    const text = sourceBlock.getText()
    const charList = text.split('').map((_, i) => {
        const meta = CharacterMetadata.create({
            style: sourceBlock.getInlineStyleAt(i),
        })
        return applyDiffStyle(meta, status)
    })

    return {
        text,
        charList,
        type: sourceBlock.getType(),
        depth: sourceBlock.getDepth(),
        data: sourceBlock.getData(),
        imageEntity,
        imageDiffStatus: imageEntity ? status : undefined,
    }
}

function trimLeadingRemovedListMarker(block: MergedBlock): MergedBlock {
    const match = block.text.match(LIST_MARKER_PREFIX_REGEX)
    if (!match) return block

    const prefixLength = match[0].length
    const canTrim = block.charList.slice(0, prefixLength).every((meta) => {
        const style = meta.getStyle()
        return style.has('DIFF_REMOVED') && !style.has('DIFF_ADDED')
    })

    if (!canTrim) return block

    return {
        ...block,
        text: block.text.slice(prefixLength),
        charList: block.charList.slice(prefixLength),
    }
}

function getTextSimilarity(oldText: string, newText: string): number {
    const diffs = diffWordsWithGuidanceTokens(oldText, newText)
    const unchangedChars = diffs.reduce((acc, part) => {
        if (!part.added && !part.removed) {
            return acc + part.value.length
        }
        return acc
    }, 0)

    return unchangedChars / Math.max(oldText.length, newText.length, 1)
}

function isListBlockType(type: string): boolean {
    return type === 'ordered-list-item' || type === 'unordered-list-item'
}

function stripListMarker(text: string): string {
    return text.replace(LIST_MARKER_PREFIX_REGEX, '').trim()
}

function getPairingScore(
    oldBlock: ContentBlock,
    newBlock: ContentBlock,
    oldImageByBlockKey: Map<string, ImageEntitySnapshot | undefined>,
    newImageByBlockKey: Map<string, ImageEntitySnapshot | undefined>,
): number | null {
    const oldImage = oldImageByBlockKey.get(oldBlock.getKey())
    const newImage = newImageByBlockKey.get(newBlock.getKey())
    const hasImage = !!oldImage || !!newImage
    if (hasImage) {
        if (!oldImage || !newImage) return null
        return getImageEntitySignature(oldImage) ===
            getImageEntitySignature(newImage)
            ? 1
            : null
    }

    const oldText = oldBlock.getText()
    const newText = newBlock.getText()
    const rawSimilarity = getTextSimilarity(oldText, newText)

    if (
        oldBlock.getType() === newBlock.getType() &&
        oldBlock.getDepth() === newBlock.getDepth()
    ) {
        return rawSimilarity >= 0.35 ? rawSimilarity : null
    }

    const oldIsList = isListBlockType(oldBlock.getType())
    const newIsList = isListBlockType(newBlock.getType())
    const listMigration = oldIsList !== newIsList
    if (listMigration) {
        const oldNormalized = stripListMarker(oldText)
        const newNormalized = stripListMarker(newText)
        const normalizedSimilarity = getTextSimilarity(
            oldNormalized,
            newNormalized,
        )
        const similarity = Math.max(rawSimilarity, normalizedSimilarity)
        return similarity >= 0.35 ? similarity : null
    }

    // Keep strict pairing for unrelated cross-type blocks.
    return rawSimilarity >= 0.85 ? rawSimilarity : null
}

function mergeChangedRuns(
    oldRunBlocks: ContentBlock[],
    newRunBlocks: ContentBlock[],
    oldImageByBlockKey: Map<string, ImageEntitySnapshot | undefined>,
    newImageByBlockKey: Map<string, ImageEntitySnapshot | undefined>,
): MergedBlock[] {
    const oldCount = oldRunBlocks.length
    const newCount = newRunBlocks.length
    const dp: number[][] = Array.from({ length: oldCount + 1 }, () =>
        Array.from({ length: newCount + 1 }, () => 0),
    )

    for (let i = oldCount; i >= 0; i--) {
        for (let j = newCount; j >= 0; j--) {
            if (i === oldCount && j === newCount) continue

            const skipOld = i < oldCount ? dp[i + 1][j] : -Infinity
            const skipNew = j < newCount ? dp[i][j + 1] : -Infinity
            const pairScore =
                i < oldCount && j < newCount
                    ? getPairingScore(
                          oldRunBlocks[i],
                          newRunBlocks[j],
                          oldImageByBlockKey,
                          newImageByBlockKey,
                      )
                    : null
            const pair =
                pairScore !== null ? pairScore + dp[i + 1][j + 1] : -Infinity

            dp[i][j] = Math.max(skipOld, skipNew, pair)
        }
    }

    const mergedBlocks: MergedBlock[] = []
    let i = 0
    let j = 0
    const EPSILON = 1e-9

    while (i < oldCount || j < newCount) {
        if (i >= oldCount) {
            mergedBlocks.push(
                styleWholeBlock(
                    newRunBlocks[j],
                    'added',
                    newImageByBlockKey.get(newRunBlocks[j].getKey()),
                ),
            )
            j++
            continue
        }

        if (j >= newCount) {
            const oldBlock = oldRunBlocks[i]
            const oldImage = oldImageByBlockKey.get(oldBlock.getKey())
            if (isIgnorableEmptyBlock(oldBlock, oldImage)) {
                i++
                continue
            }

            mergedBlocks.push(styleWholeBlock(oldBlock, 'removed', oldImage))
            i++
            continue
        }

        const pairScore = getPairingScore(
            oldRunBlocks[i],
            newRunBlocks[j],
            oldImageByBlockKey,
            newImageByBlockKey,
        )
        const pair =
            pairScore !== null ? pairScore + dp[i + 1][j + 1] : -Infinity
        const skipOld = dp[i + 1][j]
        const skipNew = dp[i][j + 1]
        const best = dp[i][j]

        if (pairScore !== null && Math.abs(pair - best) < EPSILON) {
            mergedBlocks.push(
                mergeChangedBlocks(
                    oldRunBlocks[i],
                    newRunBlocks[j],
                    oldImageByBlockKey,
                    newImageByBlockKey,
                ),
            )
            i++
            j++
            continue
        }

        if (Math.abs(skipOld - best) < EPSILON && skipOld >= skipNew) {
            const oldBlock = oldRunBlocks[i]
            const oldImage = oldImageByBlockKey.get(oldBlock.getKey())
            if (isIgnorableEmptyBlock(oldBlock, oldImage)) {
                i++
                continue
            }

            mergedBlocks.push(styleWholeBlock(oldBlock, 'removed', oldImage))
            i++
            continue
        }

        mergedBlocks.push(
            styleWholeBlock(
                newRunBlocks[j],
                'added',
                newImageByBlockKey.get(newRunBlocks[j].getKey()),
            ),
        )
        j++
    }

    return mergedBlocks
}

function mergeChangedBlocks(
    oldBlock: ContentBlock,
    newBlock: ContentBlock,
    oldImageByBlockKey: Map<string, ImageEntitySnapshot | undefined>,
    newImageByBlockKey: Map<string, ImageEntitySnapshot | undefined>,
): MergedBlock {
    const oldImage = oldImageByBlockKey.get(oldBlock.getKey())
    const newImage = newImageByBlockKey.get(newBlock.getKey())
    if (oldImage || newImage) {
        if (
            oldImage &&
            newImage &&
            getImageEntitySignature(oldImage) ===
                getImageEntitySignature(newImage)
        ) {
            return styleWholeBlock(newBlock, null, newImage)
        }

        if (newImage) {
            return styleWholeBlock(newBlock, 'added', newImage)
        }

        return styleWholeBlock(oldBlock, 'removed', oldImage)
    }

    const oldText = oldBlock.getText()
    const newText = newBlock.getText()
    const diffs = diffWordsWithGuidanceTokens(oldText, newText)

    let oldPos = 0
    let newPos = 0
    let text = ''
    const charList: CharacterMetadata[] = []

    for (const part of diffs) {
        for (let i = 0; i < part.value.length; i++) {
            const ch = part.value[i]

            let baseMeta: CharacterMetadata
            if (part.removed && oldPos < oldText.length) {
                baseMeta = CharacterMetadata.create({
                    style: oldBlock.getInlineStyleAt(oldPos),
                })
                oldPos++
            } else if (part.added && newPos < newText.length) {
                baseMeta = CharacterMetadata.create({
                    style: newBlock.getInlineStyleAt(newPos),
                })
                newPos++
            } else if (newPos < newText.length) {
                baseMeta = CharacterMetadata.create({
                    style: newBlock.getInlineStyleAt(newPos),
                })
                oldPos++
                newPos++
            } else if (oldPos < oldText.length) {
                baseMeta = CharacterMetadata.create({
                    style: oldBlock.getInlineStyleAt(oldPos),
                })
                oldPos++
            } else {
                baseMeta = CharacterMetadata.create()
            }

            text += ch
            charList.push(
                applyDiffStyle(
                    baseMeta,
                    part.added ? 'added' : part.removed ? 'removed' : null,
                ),
            )
        }
    }

    const mergedBlock: MergedBlock = {
        text,
        charList,
        type: newBlock.getType(),
        depth: newBlock.getDepth(),
        data: newBlock.getData(),
    }

    if (isListBlockType(newBlock.getType())) {
        return trimLeadingRemovedListMarker(mergedBlock)
    }

    return mergedBlock
}

/**
 * Produces a single merged ContentState where added/removed text is interleaved
 * and tagged with DIFF_ADDED / DIFF_REMOVED inline styles.
 *
 * How it works:
 * 1. Extract plain text and diff it (treating guidance tokens as atomic units)
 * 2. Build parallel charInfo arrays from both ContentStates to preserve original
 *    inline styles, block types, and depths
 * 3. Walk the diff output char-by-char, pulling style info from the correct
 *    source (oldCharInfos for removed, newCharInfos for added/unchanged)
 *    and overlaying DIFF_ADDED/DIFF_REMOVED styles
 * 4. On '\n' chars, flush the current block and pick up the next block's type/depth
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
    const oldBlocks = oldContentState.getBlocksAsArray()
    const newBlocks = newContentState.getBlocksAsArray()
    const oldImageByBlockKey = new Map<string, ImageEntitySnapshot | undefined>(
        oldBlocks.map((block) => [
            block.getKey(),
            getImageEntitySnapshot(oldContentState, block),
        ]),
    )
    const newImageByBlockKey = new Map<string, ImageEntitySnapshot | undefined>(
        newBlocks.map((block) => [
            block.getKey(),
            getImageEntitySnapshot(newContentState, block),
        ]),
    )
    const oldSignatures = oldBlocks.map(
        (block) =>
            `${block.getType()}|${block.getDepth()}|${block.getText()}|${getImageEntitySignature(
                oldImageByBlockKey.get(block.getKey()),
            )}`,
    )
    const newSignatures = newBlocks.map(
        (block) =>
            `${block.getType()}|${block.getDepth()}|${block.getText()}|${getImageEntitySignature(
                newImageByBlockKey.get(block.getKey()),
            )}`,
    )
    const blockDiffs = diffArrays(oldSignatures, newSignatures)

    let oldPos = 0
    let newPos = 0
    const mergedBlocks: MergedBlock[] = []
    for (let partIndex = 0; partIndex < blockDiffs.length; partIndex++) {
        const part = blockDiffs[partIndex]
        const count = part.count ?? part.value.length

        if (part.removed && blockDiffs[partIndex + 1]?.added) {
            const nextPart = blockDiffs[partIndex + 1]
            const nextCount = nextPart.count ?? nextPart.value.length
            const oldRunBlocks = oldBlocks.slice(oldPos, oldPos + count)
            const newRunBlocks = newBlocks.slice(newPos, newPos + nextCount)
            mergedBlocks.push(
                ...mergeChangedRuns(
                    oldRunBlocks,
                    newRunBlocks,
                    oldImageByBlockKey,
                    newImageByBlockKey,
                ),
            )

            oldPos += count
            newPos += nextCount
            partIndex++
            continue
        }

        if (part.removed) {
            for (let i = 0; i < count; i++) {
                const block = oldBlocks[oldPos + i]
                const imageEntity = oldImageByBlockKey.get(block.getKey())
                if (isIgnorableEmptyBlock(block, imageEntity)) continue

                mergedBlocks.push(
                    styleWholeBlock(block, 'removed', imageEntity),
                )
            }
            oldPos += count
            continue
        }

        if (part.added) {
            for (let i = 0; i < count; i++) {
                const block = newBlocks[newPos + i]
                mergedBlocks.push(
                    styleWholeBlock(
                        block,
                        'added',
                        newImageByBlockKey.get(block.getKey()),
                    ),
                )
            }
            newPos += count
            continue
        }

        for (let i = 0; i < count; i++) {
            const block = newBlocks[newPos + i]
            mergedBlocks.push(
                styleWholeBlock(
                    block,
                    null,
                    newImageByBlockKey.get(block.getKey()),
                ),
            )
        }
        oldPos += count
        newPos += count
    }

    const pendingImageEntities: Array<{
        blockIndex: number
        imageEntity: ImageEntitySnapshot
        diffStatus: DiffStatus
    }> = []
    const contentBlocks = mergedBlocks.map((block, blockIndex) => {
        if (block.imageEntity) {
            pendingImageEntities.push({
                blockIndex,
                imageEntity: block.imageEntity,
                diffStatus: block.imageDiffStatus ?? null,
            })
        }

        return new ContentBlock({
            key: genKey(),
            type: block.type,
            text: block.text,
            characterList: List(block.charList),
            depth: block.depth,
            data: block.data,
        })
    })

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
        const textLength = mergedBlocks[pendingEntity.blockIndex].text.length
        const selection = SelectionState.createEmpty(
            mergedBlockKeys[pendingEntity.blockIndex],
        ).merge({
            anchorOffset: 0,
            focusOffset: Math.max(textLength, 1),
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
