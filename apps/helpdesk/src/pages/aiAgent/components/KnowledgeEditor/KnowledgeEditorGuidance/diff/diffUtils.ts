import type { Change } from 'diff'
import { diffWords } from 'diff'
import type { ContentState } from 'draft-js'
import {
    CharacterMetadata,
    ContentBlock,
    ContentState as ContentStateClass,
    genKey,
    Modifier,
    SelectionState,
} from 'draft-js'
import { List } from 'immutable'

import { guidanceVariableRegex } from 'pages/common/draftjs/plugins/guidance-variables/constants'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

// Matches guidance variables ($$$...$$$) and actions (&&&...&&&) in plain text
const guidanceTokenRegex = /\$\$\$[^$]*\$\$\$|&&&[^&]*&&&/g
// SOH (Start of Heading) control character — used as an invisible word boundary
// so that diffWords treats each guidance token as a separate, atomic unit
const BOUNDARY = String.fromCharCode(1)
const boundaryCleanupRegex = new RegExp(BOUNDARY, 'g')

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

type CharInfo =
    | {
          isBlockBoundary: false
          style: ReturnType<ContentBlock['getInlineStyleAt']>
          blockType: string
          blockDepth: number
      }
    | {
          isBlockBoundary: true
          nextBlockType: string
          nextBlockDepth: number
      }

/**
 * Builds a flat array that maps each character position in the plain text
 * to its original inline styles, block type, and depth. Block boundaries
 * (the '\n' between blocks in getPlainText output) are represented as
 * special markers carrying the next block's type/depth.
 *
 * This array is consumed by computeUnifiedDiff to preserve original
 * formatting when building the merged ContentState.
 */
function buildCharInfos(contentState: ContentState): CharInfo[] {
    const blocks = contentState.getBlocksAsArray()
    const infos: CharInfo[] = []

    for (let b = 0; b < blocks.length; b++) {
        const block = blocks[b]
        const text = block.getText()
        const type = block.getType()
        const depth = block.getDepth()

        for (let i = 0; i < text.length; i++) {
            infos.push({
                isBlockBoundary: false,
                style: block.getInlineStyleAt(i),
                blockType: type,
                blockDepth: depth,
            })
        }

        if (b < blocks.length - 1) {
            infos.push({
                isBlockBoundary: true,
                nextBlockType: blocks[b + 1].getType(),
                nextBlockDepth: blocks[b + 1].getDepth(),
            })
        }
    }

    return infos
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
    const oldPlainText = oldContentState.getPlainText('\n')
    const newPlainText = newContentState.getPlainText('\n')

    const diffs = diffWordsWithGuidanceTokens(oldPlainText, newPlainText)

    const oldCharInfos = buildCharInfos(oldContentState)
    const newCharInfos = buildCharInfos(newContentState)

    let oldPos = 0
    let newPos = 0

    type MergedBlock = {
        text: string
        charList: CharacterMetadata[]
        type: string
        depth: number
    }

    const mergedBlocks: MergedBlock[] = []
    let currentBlockText = ''
    let currentBlockChars: CharacterMetadata[] = []

    const firstNewBlock = newContentState.getBlocksAsArray()[0]
    let currentBlockType = firstNewBlock?.getType() ?? 'unstyled'
    let currentBlockDepth = firstNewBlock?.getDepth() ?? 0

    for (const part of diffs) {
        for (let i = 0; i < part.value.length; i++) {
            const ch = part.value[i]

            if (ch === '\n') {
                mergedBlocks.push({
                    text: currentBlockText,
                    charList: currentBlockChars,
                    type: currentBlockType,
                    depth: currentBlockDepth,
                })
                currentBlockText = ''
                currentBlockChars = []

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

            currentBlockText += ch
            currentBlockChars.push(charMeta)
        }
    }

    mergedBlocks.push({
        text: currentBlockText,
        charList: currentBlockChars,
        type: currentBlockType,
        depth: currentBlockDepth,
    })

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

    const mergedContentState =
        ContentStateClass.createFromBlockArray(contentBlocks)

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
