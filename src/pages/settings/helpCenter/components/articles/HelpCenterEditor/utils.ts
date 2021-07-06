import {
    draftToMarkdown as _draftToMarkdown,
    markdownToDraft as _markdownToDraft,
} from 'markdown-draft-js'
import {RawDraftContentState} from 'draft-js'

export const draftToMarkdown = (rawObject: RawDraftContentState): string =>
    _draftToMarkdown(rawObject, {
        entityItems: {
            IMAGE: {
                open: function () {
                    return ''
                },
                close: function (entity) {
                    if (!entity) {
                        return ''
                    }
                    return `![](${(entity as {data: {src: string}}).data?.src})`
                },
            },
        },
    })

export const markdownToDraft = (markdownString: string): RawDraftContentState =>
    _markdownToDraft(markdownString, {
        blockEntities: {
            image: function (item) {
                return {
                    type: 'IMAGE',
                    mutability: 'MUTABLE',
                    data: {src: item?.src},
                    text: ' ',
                }
            },
        },
    })

// When parsing the markdown string, "markdown-drafjs" creates the images entities in draftjs' raw data
// and creates a block corresponding (with entityRanges.key)
// To render the images correctly, "react-draft-wysiwyg" needs the images to be wrapped
// in an "atomic" block.
// This function loops on the image entities created and create an
// 'atomic' block for each one of them
export const insertAtomicBlocksForImagesEntities = (
    rawData: RawDraftContentState
): RawDraftContentState => {
    const {blocks, entityMap} = rawData

    Object.keys(entityMap).forEach((entityKey) => {
        if (entityMap[entityKey].type === 'IMAGE') {
            const eKey = parseInt(entityKey)
            const blockKey = Object.keys(blocks).find((blockKey) => {
                const bKey = parseInt(blockKey)
                if (blocks[bKey].entityRanges[0]?.key === eKey) {
                    return bKey
                }
            })
            if (blockKey) {
                const bKey = parseInt(blockKey)
                blocks[bKey] = {
                    ...blocks[bKey],
                    type: 'atomic',
                    text: ' ',
                    entityRanges: [{offset: 0, length: 1, key: eKey}],
                }
            }
        }
    })

    return {
        blocks,
        entityMap,
    }
}
