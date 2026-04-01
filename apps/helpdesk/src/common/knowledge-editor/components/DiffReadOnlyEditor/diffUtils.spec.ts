import { CharacterMetadata, ContentBlock, ContentState, genKey } from 'draft-js'
import { Map as ImmutableMap, List } from 'immutable'

import { addDiffEntities, computeUnifiedDiff } from './diffUtils'

function createContentState(
    blocks: {
        text: string
        type?: string
        depth?: number
        data?: Record<string, unknown>
    }[],
): ContentState {
    const contentBlocks = blocks.map(
        (block) =>
            new ContentBlock({
                key: genKey(),
                type: block.type ?? 'unstyled',
                text: block.text,
                characterList: List(
                    block.text.split('').map(() => CharacterMetadata.create()),
                ),
                depth: block.depth ?? 0,
                data: block.data ? ImmutableMap(block.data) : undefined,
            }),
    )
    return ContentState.createFromBlockArray(contentBlocks)
}

function getBlockTexts(contentState: ContentState): string[] {
    return contentState.getBlocksAsArray().map((block) => block.getText())
}

function getDiffStyles(
    contentState: ContentState,
): Array<{ text: string; styles: string[] }> {
    const result: Array<{ text: string; styles: string[] }> = []
    for (const block of contentState.getBlocksAsArray()) {
        const text = block.getText()
        for (let i = 0; i < text.length; i++) {
            const style = block.getInlineStyleAt(i)
            result.push({
                text: text[i],
                styles: style.toArray(),
            })
        }
    }
    return result
}

function hasUnpairedSurrogate(value: string): boolean {
    for (let index = 0; index < value.length; index += 1) {
        const codeUnit = value.charCodeAt(index)

        if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
            const nextCodeUnit = value.charCodeAt(index + 1)
            if (!(nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff)) {
                return true
            }
            index += 1
            continue
        }

        if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
            return true
        }
    }

    return false
}

function createImageContentState(src: string, type = 'img'): ContentState {
    let contentState = ContentState.createFromText('')
    contentState = contentState.createEntity(type, 'MUTABLE', {
        src,
        width: 320,
    })
    const entityKey = contentState.getLastCreatedEntityKey()

    const block = new ContentBlock({
        key: genKey(),
        type: 'atomic',
        text: ' ',
        characterList: List([
            CharacterMetadata.create({
                entity: entityKey,
            }),
        ]),
        depth: 0,
    })

    return ContentState.createFromBlockArray(
        [block],
        contentState.getEntityMap(),
    )
}

describe('computeUnifiedDiff', () => {
    it('returns identical content with no diff styles when texts match', () => {
        const old = createContentState([{ text: 'Hello world' }])
        const new_ = createContentState([{ text: 'Hello world' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        expect(getBlockTexts(mergedContentState)).toEqual(['Hello world'])
        const styles = getDiffStyles(mergedContentState)
        styles.forEach((s) => {
            expect(s.styles).not.toContain('DIFF_ADDED')
            expect(s.styles).not.toContain('DIFF_REMOVED')
        })
    })

    it('marks added text with DIFF_ADDED style', () => {
        const old = createContentState([{ text: 'Hello' }])
        const new_ = createContentState([{ text: 'Hello world' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const fullText = mergedContentState.getPlainText('')
        expect(fullText).toContain('Hello')
        expect(fullText).toContain('world')

        const styles = getDiffStyles(mergedContentState)
        const addedChars = styles.filter((s) => s.styles.includes('DIFF_ADDED'))
        expect(addedChars.length).toBeGreaterThan(0)
        const addedText = addedChars.map((s) => s.text).join('')
        expect(addedText).toContain('world')
    })

    it('marks removed text with DIFF_REMOVED style', () => {
        const old = createContentState([{ text: 'Hello world' }])
        const new_ = createContentState([{ text: 'Hello' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const fullText = mergedContentState.getPlainText('')
        expect(fullText).toContain('Hello')
        expect(fullText).toContain('world')

        const styles = getDiffStyles(mergedContentState)
        const removedChars = styles.filter((s) =>
            s.styles.includes('DIFF_REMOVED'),
        )
        expect(removedChars.length).toBeGreaterThan(0)
        const removedText = removedChars.map((s) => s.text).join('')
        expect(removedText).toContain('world')
    })

    it('handles word replacement with both added and removed styles', () => {
        const old = createContentState([{ text: 'Hello world' }])
        const new_ = createContentState([{ text: 'Hello planet' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const styles = getDiffStyles(mergedContentState)
        const removedChars = styles.filter((s) =>
            s.styles.includes('DIFF_REMOVED'),
        )
        const addedChars = styles.filter((s) => s.styles.includes('DIFF_ADDED'))

        const removedText = removedChars.map((s) => s.text).join('')
        const addedText = addedChars.map((s) => s.text).join('')

        expect(removedText).toContain('world')
        expect(addedText).toContain('planet')
    })

    it('handles emoji replacements without introducing broken surrogate pairs', () => {
        const old = createContentState([
            { text: `Escalation summary ${String.fromCodePoint(0x1f604)}` },
        ])
        const new_ = createContentState([
            { text: `Escalation summary ${String.fromCodePoint(0x1f605)}` },
        ])

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const mergedText = mergedContentState.getPlainText('\n')

        expect(mergedText).toContain(String.fromCodePoint(0x1f604))
        expect(mergedText).toContain(String.fromCodePoint(0x1f605))
        expect(mergedText).not.toContain('\uFFFD')
        expect(hasUnpairedSurrogate(mergedText)).toBe(false)
    })

    it('handles multi-block content', () => {
        const old = createContentState([
            { text: 'Line one' },
            { text: 'Line two' },
        ])
        const new_ = createContentState([
            { text: 'Line one' },
            { text: 'Line changed' },
        ])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const blocks = mergedContentState.getBlocksAsArray()
        expect(blocks.length).toBeGreaterThanOrEqual(2)
    })

    it('keeps trailing removed blocks when there is no paired addition', () => {
        const old = createContentState([
            { text: 'Shared intro' },
            { text: 'Legacy tail' },
        ])
        const new_ = createContentState([{ text: 'Shared intro' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const blocks = mergedContentState.getBlocksAsArray()

        expect(blocks).toHaveLength(2)
        expect(blocks[0].getText()).toBe('Shared intro')
        expect(blocks[1].getText()).toBe('Legacy tail')
        const isFullyRemoved = blocks[1]
            .getCharacterList()
            .toArray()
            .every((meta) => meta.getStyle().has('DIFF_REMOVED'))
        expect(isFullyRemoved).toBe(true)
    })

    it('keeps trailing added blocks when there is no paired removal', () => {
        const old = createContentState([{ text: 'Shared intro' }])
        const new_ = createContentState([
            { text: 'Shared intro' },
            { text: 'New tail' },
        ])

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const blocks = mergedContentState.getBlocksAsArray()

        expect(blocks).toHaveLength(2)
        expect(blocks[0].getText()).toBe('Shared intro')
        expect(blocks[1].getText()).toBe('New tail')
        const isFullyAdded = blocks[1]
            .getCharacterList()
            .toArray()
            .every((meta) => meta.getStyle().has('DIFF_ADDED'))
        expect(isFullyAdded).toBe(true)
    })

    it('handles empty old content with all-new text', () => {
        const old = createContentState([{ text: '' }])
        const new_ = createContentState([{ text: 'Brand new text' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const styles = getDiffStyles(mergedContentState)
        const addedChars = styles.filter((s) => s.styles.includes('DIFF_ADDED'))
        expect(addedChars.length).toBeGreaterThan(0)
    })

    it('handles empty new content with all-removed text', () => {
        const old = createContentState([{ text: 'Old text' }])
        const new_ = createContentState([{ text: '' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const styles = getDiffStyles(mergedContentState)
        const removedChars = styles.filter((s) =>
            s.styles.includes('DIFF_REMOVED'),
        )
        expect(removedChars.length).toBeGreaterThan(0)
    })

    it('handles both contents empty', () => {
        const old = createContentState([{ text: '' }])
        const new_ = createContentState([{ text: '' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const blocks = mergedContentState.getBlocksAsArray()
        expect(blocks.length).toBeGreaterThanOrEqual(1)
        expect(blocks[0].getText()).toBe('')
    })

    it('preserves block types from source content', () => {
        const old = createContentState([
            { text: 'Header', type: 'header-one' },
            { text: 'Body text', type: 'unstyled' },
        ])
        const new_ = createContentState([
            { text: 'Header', type: 'header-one' },
            { text: 'Body text', type: 'unstyled' },
        ])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const blocks = mergedContentState.getBlocksAsArray()
        expect(blocks[0].getType()).toBe('header-one')
        expect(blocks[1].getType()).toBe('unstyled')
    })

    it('preserves list block metadata from the new content', () => {
        const old = createContentState([
            {
                text: 'List item',
                type: 'ordered-list-item',
                depth: 0,
                data: { visualListStyle: 'ordered' },
            },
        ])
        const new_ = createContentState([
            {
                text: 'List item updated',
                type: 'ordered-list-item',
                depth: 0,
                data: { visualListStyle: 'unordered' },
            },
        ])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const firstBlock = mergedContentState.getBlocksAsArray()[0]
        expect(firstBlock.getType()).toBe('ordered-list-item')
        expect(firstBlock.getData().get('visualListStyle')).toBe('unordered')
    })

    it('keeps list items contiguous when old dash paragraphs migrate to a new unordered list', () => {
        const old = createContentState([
            {
                text: 'If a customer requires a spare part for their product, and the product is within the warranty window.',
            },
            { text: ' ' },
            { text: 'The only spare parts available that we have are:' },
            { text: '- Cash bands' },
            { text: '- Finder Card Charging Cable /Charging cord / Charger' },
            { text: '- Backpack straps' },
        ])
        const new_ = createContentState([
            { text: 'If a customer requires a spare part for their product:' },
            {
                text: 'Cash bands',
                type: 'unordered-list-item',
                depth: 0,
                data: { visualListStyle: 'unordered' },
            },
            {
                text: 'Charging Cable / Charging cord / Charger only for Finder Card - Android or Apple (not for Finder for MagSafe)',
                type: 'unordered-list-item',
                depth: 0,
                data: { visualListStyle: 'unordered' },
            },
            {
                text: 'Backpack straps',
                type: 'unordered-list-item',
                depth: 0,
                data: { visualListStyle: 'unordered' },
            },
            {
                text: 'Verify the Order:',
                type: 'ordered-list-item',
                depth: 0,
                data: { visualListStyle: 'ordered' },
            },
        ])

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const blocks = mergedContentState.getBlocksAsArray()

        const unorderedBlockIndexes = blocks
            .map((block, index) => ({ block, index }))
            .filter(({ block }) => block.getType() === 'unordered-list-item')
            .map(({ index }) => index)

        expect(unorderedBlockIndexes.length).toBe(3)
        expect(unorderedBlockIndexes).toEqual([
            unorderedBlockIndexes[0],
            unorderedBlockIndexes[0] + 1,
            unorderedBlockIndexes[0] + 2,
        ])
        const unorderedTexts = blocks
            .filter((block) => block.getType() === 'unordered-list-item')
            .map((block) => block.getText())
        unorderedTexts.forEach((text) => {
            expect(text.startsWith('- ')).toBe(false)
        })
        expect(unorderedTexts[0]).toContain('Cash bands')
        expect(unorderedTexts[1]).toContain(
            'Charging Cable / Charging cord / Charger only for Finder Card - Android or Apple (not for Finder for MagSafe)',
        )
        expect(unorderedTexts[2]).toContain('Backpack straps')

        const standaloneLegacyDashBlocks = blocks.filter(
            (block) =>
                block.getType() === 'unstyled' &&
                /^-\s+(Cash bands|Finder Card Charging Cable|Backpack straps)/.test(
                    block.getText(),
                ),
        )
        expect(standaloneLegacyDashBlocks).toHaveLength(0)
    })

    it('keeps a leading marker when it is added (not removed) in a list item', () => {
        const old = createContentState([
            {
                text: 'Cash bands',
                type: 'unordered-list-item',
                depth: 0,
                data: { visualListStyle: 'unordered' },
            },
        ])
        const new_ = createContentState([
            {
                text: '- Cash bands',
                type: 'unordered-list-item',
                depth: 0,
                data: { visualListStyle: 'unordered' },
            },
        ])

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const firstBlock = mergedContentState.getBlocksAsArray()[0]

        expect(firstBlock.getText().startsWith('- ')).toBe(true)
    })

    it('does not pair unrelated cross-type blocks with low similarity', () => {
        const old = createContentState([
            { text: 'Warranty is expired', type: 'unstyled' },
        ])
        const new_ = createContentState([
            {
                text: 'Collect order number',
                type: 'ordered-list-item',
                depth: 0,
                data: { visualListStyle: 'ordered' },
            },
        ])

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const blocks = mergedContentState.getBlocksAsArray()

        expect(blocks).toHaveLength(2)
        expect(blocks[0].getType()).toBe('unstyled')
        expect(blocks[1].getType()).toBe('ordered-list-item')

        const removedStyles = blocks[0]
            .getCharacterList()
            .toArray()
            .every((meta) => meta.getStyle().has('DIFF_REMOVED'))
        const addedStyles = blocks[1]
            .getCharacterList()
            .toArray()
            .every((meta) => meta.getStyle().has('DIFF_ADDED'))

        expect(removedStyles).toBe(true)
        expect(addedStyles).toBe(true)
    })

    it('treats guidance action tokens ($$$...$$$) as atomic units', () => {
        const old = createContentState([{ text: 'Start $$$action1$$$ end' }])
        const new_ = createContentState([{ text: 'Start $$$action2$$$ end' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const fullText = mergedContentState.getPlainText('')
        expect(fullText).toContain('$$$action1$$$')
        expect(fullText).toContain('$$$action2$$$')

        const styles = getDiffStyles(mergedContentState)
        const removedChars = styles.filter((s) =>
            s.styles.includes('DIFF_REMOVED'),
        )
        const addedChars = styles.filter((s) => s.styles.includes('DIFF_ADDED'))
        const removedText = removedChars.map((s) => s.text).join('')
        const addedText = addedChars.map((s) => s.text).join('')

        expect(removedText).toContain('$$$action1$$$')
        expect(addedText).toContain('$$$action2$$$')
    })

    it('treats guidance variable tokens (&&&...&&&) as atomic units', () => {
        const old = createContentState([{ text: 'Hi &&&name&&&!' }])
        const new_ = createContentState([{ text: 'Hi &&&email&&&!' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const fullText = mergedContentState.getPlainText('')
        expect(fullText).toContain('&&&name&&&')
        expect(fullText).toContain('&&&email&&&')
    })

    it('handles guidance tokens appearing in only one version', () => {
        const old = createContentState([{ text: 'Hello there' }])
        const new_ = createContentState([{ text: 'Hello $$$action1$$$ there' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const fullText = mergedContentState.getPlainText('')
        expect(fullText).toContain('$$$action1$$$')

        const styles = getDiffStyles(mergedContentState)
        const addedChars = styles.filter((s) => s.styles.includes('DIFF_ADDED'))
        const addedText = addedChars.map((s) => s.text).join('')
        expect(addedText).toContain('$$$action1$$$')
    })

    it('preserves unchanged text without diff styles between changes', () => {
        const old = createContentState([{ text: 'The quick brown fox' }])
        const new_ = createContentState([{ text: 'The slow brown fox' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)

        const styles = getDiffStyles(mergedContentState)
        const unchangedChars = styles.filter(
            (s) =>
                !s.styles.includes('DIFF_ADDED') &&
                !s.styles.includes('DIFF_REMOVED'),
        )
        const unchangedText = unchangedChars.map((s) => s.text).join('')
        expect(unchangedText).toContain('The ')
        expect(unchangedText).toContain(' brown fox')
    })

    it('preserves image entities and marks added images', () => {
        const old = createContentState([{ text: '' }])
        const new_ = createImageContentState('https://example.com/new.png')

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const imageBlock = mergedContentState.getBlocksAsArray()[0]

        expect(imageBlock.getType()).toBe('atomic')
        expect(imageBlock.getInlineStyleAt(0).has('DIFF_ADDED')).toBe(true)

        const entityKey = imageBlock.getEntityAt(0)
        expect(entityKey).not.toBeNull()
        const entity = mergedContentState.getEntity(entityKey)
        expect(entity.getType()).toBe('img')
        expect(entity.getData()).toMatchObject({
            src: 'https://example.com/new.png',
            diffStatus: 'added',
        })
    })

    it('preserves image entities and marks removed images', () => {
        const old = createImageContentState('https://example.com/old.png')
        const new_ = createContentState([{ text: '' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const imageBlock = mergedContentState.getBlocksAsArray()[0]

        expect(imageBlock.getType()).toBe('atomic')
        expect(imageBlock.getInlineStyleAt(0).has('DIFF_REMOVED')).toBe(true)

        const entityKey = imageBlock.getEntityAt(0)
        expect(entityKey).not.toBeNull()
        const entity = mergedContentState.getEntity(entityKey)
        expect(entity.getType()).toBe('img')
        expect(entity.getData()).toMatchObject({
            src: 'https://example.com/old.png',
            diffStatus: 'removed',
        })
    })

    it('renders changed images as separate removed and added atomic blocks', () => {
        const old = createImageContentState('https://example.com/old.png')
        const new_ = createImageContentState('https://example.com/new.png')

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const blocks = mergedContentState.getBlocksAsArray()

        expect(blocks).toHaveLength(2)
        expect(blocks[0].getType()).toBe('atomic')
        expect(blocks[1].getType()).toBe('atomic')
        expect(blocks[0].getInlineStyleAt(0).has('DIFF_REMOVED')).toBe(true)
        expect(blocks[1].getInlineStyleAt(0).has('DIFF_ADDED')).toBe(true)
    })

    it('keeps unchanged images as a single atomic block without diff styles', () => {
        const old = createImageContentState('https://example.com/same.png')
        const new_ = createImageContentState('https://example.com/same.png')

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const blocks = mergedContentState.getBlocksAsArray()

        expect(blocks).toHaveLength(1)
        expect(blocks[0].getType()).toBe('atomic')
        expect(blocks[0].getInlineStyleAt(0).has('DIFF_REMOVED')).toBe(false)
        expect(blocks[0].getInlineStyleAt(0).has('DIFF_ADDED')).toBe(false)

        const entityKey = blocks[0].getEntityAt(0)
        expect(entityKey).not.toBeNull()
        const entity = mergedContentState.getEntity(entityKey)
        expect(entity.getData()).toMatchObject({
            src: 'https://example.com/same.png',
            diffStatus: null,
        })
    })

    it('pairs highly similar non-list cross-type blocks into a single merged block', () => {
        const old = createContentState([
            {
                text: 'Verify order details for this request',
                type: 'header-two',
            },
        ])
        const new_ = createContentState([
            {
                text: 'Verify order details for this request',
                type: 'blockquote',
            },
        ])

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const blocks = mergedContentState.getBlocksAsArray()

        expect(blocks).toHaveLength(1)
        expect(blocks[0].getType()).toBe('blockquote')
        expect(blocks[0].getText()).toBe(
            'Verify order details for this request',
        )
    })

    it('treats legacy image entity types as images in diffing', () => {
        const old = createImageContentState(
            'https://example.com/old.png',
            'IMAGE',
        )
        const new_ = createContentState([{ text: '' }])

        const { mergedContentState } = computeUnifiedDiff(old, new_)
        const imageBlock = mergedContentState.getBlocksAsArray()[0]
        const entityKey = imageBlock.getEntityAt(0)

        expect(entityKey).not.toBeNull()
        const entity = mergedContentState.getEntity(entityKey)
        expect(entity.getType()).toBe('IMAGE')
        expect(entity.getData()).toMatchObject({
            src: 'https://example.com/old.png',
            diffStatus: 'removed',
        })
    })
})

describe('addDiffEntities', () => {
    function createContentStateWithDiffStyles(
        text: string,
        ranges: Array<{
            start: number
            end: number
            style: 'DIFF_ADDED' | 'DIFF_REMOVED'
        }>,
    ): ContentState {
        const charList = Array.from(text).map((_, i) => {
            let meta = CharacterMetadata.create()
            for (const range of ranges) {
                if (i >= range.start && i < range.end) {
                    meta = CharacterMetadata.applyStyle(meta, range.style)
                }
            }
            return meta
        })

        const block = new ContentBlock({
            key: genKey(),
            type: 'unstyled',
            text,
            characterList: List(charList),
            depth: 0,
        })

        return ContentState.createFromBlockArray([block])
    }

    it('creates entities for guidance action tokens with consistent diff status', () => {
        const text = 'Hello $$$myAction$$$ world'
        const actionStart = text.indexOf('$$$myAction$$$')
        const actionEnd = actionStart + '$$$myAction$$$'.length

        const contentState = createContentStateWithDiffStyles(text, [
            { start: actionStart, end: actionEnd, style: 'DIFF_ADDED' },
        ])

        const result = addDiffEntities(contentState)

        const block = result.getBlocksAsArray()[0]
        const entityKey = block.getEntityAt(actionStart)
        expect(entityKey).not.toBeNull()

        const entity = result.getEntity(entityKey)
        expect(entity.getType()).toBe('guidance_action')
        expect(entity.getData()).toEqual({
            value: '$$$myAction$$$',
            diffStatus: 'added',
        })
    })

    it('creates entities for guidance variable tokens with consistent diff status', () => {
        const text = 'Hello &&&myVar&&& world'
        const varStart = text.indexOf('&&&myVar&&&')
        const varEnd = varStart + '&&&myVar&&&'.length

        const contentState = createContentStateWithDiffStyles(text, [
            { start: varStart, end: varEnd, style: 'DIFF_REMOVED' },
        ])

        const result = addDiffEntities(contentState)

        const block = result.getBlocksAsArray()[0]
        const entityKey = block.getEntityAt(varStart)
        expect(entityKey).not.toBeNull()

        const entity = result.getEntity(entityKey)
        expect(entity.getType()).toBe('guidance_variable')
        expect(entity.getData()).toEqual({
            value: '&&&myVar&&&',
            diffStatus: 'removed',
        })
    })

    it('creates entities with null diff status for tokens without diff styles', () => {
        const text = 'Hello $$$action$$$ world'
        const contentState = createContentStateWithDiffStyles(text, [])

        const result = addDiffEntities(contentState)

        const block = result.getBlocksAsArray()[0]
        const actionStart = text.indexOf('$$$action$$$')
        const entityKey = block.getEntityAt(actionStart)
        expect(entityKey).not.toBeNull()

        const entity = result.getEntity(entityKey)
        expect(entity.getData().diffStatus).toBeNull()
    })

    it('skips tokens with inconsistent diff styles across characters', () => {
        const text = 'Hello $$$action$$$ world'
        const actionStart = text.indexOf('$$$action$$$')
        const actionMid = actionStart + 3

        const charList = Array.from(text).map((_, i) => {
            let meta = CharacterMetadata.create()
            if (i >= actionStart && i < actionMid) {
                meta = CharacterMetadata.applyStyle(meta, 'DIFF_ADDED')
            }
            return meta
        })

        const block = new ContentBlock({
            key: genKey(),
            type: 'unstyled',
            text,
            characterList: List(charList),
            depth: 0,
        })

        const contentState = ContentState.createFromBlockArray([block])
        const result = addDiffEntities(contentState)

        const resultBlock = result.getBlocksAsArray()[0]
        const entityKey = resultBlock.getEntityAt(actionStart)
        expect(entityKey).toBeNull()
    })

    it('handles content without any guidance tokens', () => {
        const text = 'Just plain text without any tokens'
        const contentState = createContentStateWithDiffStyles(text, [])

        const result = addDiffEntities(contentState)

        const block = result.getBlocksAsArray()[0]
        for (let i = 0; i < text.length; i++) {
            expect(block.getEntityAt(i)).toBeNull()
        }
    })

    it('handles multiple tokens in the same block', () => {
        const text = '$$$action1$$$ text &&&var1&&& more $$$action2$$$'

        const contentState = createContentStateWithDiffStyles(text, [])

        const result = addDiffEntities(contentState)

        const block = result.getBlocksAsArray()[0]

        const action1Start = text.indexOf('$$$action1$$$')
        const var1Start = text.indexOf('&&&var1&&&')
        const action2Start = text.indexOf('$$$action2$$$')

        expect(block.getEntityAt(action1Start)).not.toBeNull()
        expect(block.getEntityAt(var1Start)).not.toBeNull()
        expect(block.getEntityAt(action2Start)).not.toBeNull()

        const entity1 = result.getEntity(block.getEntityAt(action1Start))
        expect(entity1.getType()).toBe('guidance_action')

        const entity2 = result.getEntity(block.getEntityAt(var1Start))
        expect(entity2.getType()).toBe('guidance_variable')

        const entity3 = result.getEntity(block.getEntityAt(action2Start))
        expect(entity3.getType()).toBe('guidance_action')
    })

    it('applies entities as IMMUTABLE', () => {
        const text = 'Hello $$$action$$$ world'
        const contentState = createContentStateWithDiffStyles(text, [])

        const result = addDiffEntities(contentState)

        const block = result.getBlocksAsArray()[0]
        const actionStart = text.indexOf('$$$action$$$')
        const entityKey = block.getEntityAt(actionStart)
        const entity = result.getEntity(entityKey)
        expect(entity.getMutability()).toBe('IMMUTABLE')
    })
})
