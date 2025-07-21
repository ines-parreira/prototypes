import { render, screen } from '@testing-library/react'
import { ContentState, EditorState } from 'draft-js'

import { convertFromHTML } from '../../../../utils/editor'
import { Plugin } from '../plugins/types'
import { variable as variableDecorator } from '../plugins/variables/decorators'
import { attachEntitiesToVariables } from '../plugins/variables/utils'
import {
    createCompositeDecorator,
    createEditorStateFromHtml,
} from './draftTestUtils'
import TestEditor from './TestEditor'
import * as utils from './utils'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('DraftJS convertToHtml', () => {
    it('no decorator should not find any entity', () => {
        const composite = createCompositeDecorator()
        const html = 'this is text only'
        const content = convertFromHTML(html).getBlockMap().first()
        const decorations = composite
            .getDecorations(content, new ContentState())
            .toArray()

        expect(decorations.length).toBe(html.length)
        expect(decorations).toEqual(Array(html.length).fill(null))
    })
})

describe('DraftJS display entities', () => {
    it('variable entity in text', () => {
        const composite = createCompositeDecorator(variableDecorator)
        const text =
            'variable {{current_user.name}} and {{ticket.customer.email}}'
        let editorState = createEditorStateFromHtml(text)
        editorState = attachEntitiesToVariables(editorState)
        const positions = [
            { start: 9, length: 21 },
            { start: 35, length: 25 },
        ]

        const contentState = editorState.getCurrentContent()
        const content = contentState.getBlockMap().first()
        const decorations = composite
            .getDecorations(content, contentState)
            .toArray()

        expect(decorations.length).toBe(text.length)
        expect(content.getText()).toEqual(text)

        positions.forEach((position, index) => {
            const { start, length } = position
            const end = start + length - 1
            const begin =
                index > 0
                    ? positions[index - 1].start + positions[index - 1].length
                    : 0
            expect(utils.isEntirelyNull(decorations.slice(begin, start))).toBe(
                true,
            )
            expect(utils.isOccupied(decorations.slice(start, length))).toBe(
                true,
            )
            expect(decorations[start]).toEqual(decorations[end])
            expect(composite.getComponentForKey(decorations[start])).toBe(
                variableDecorator.component,
            )
        })
    })
})

describe('DraftJS Plugins', () => {
    it('render simple text', () => {
        const html = 'this is only text, no style'
        render(
            <TestEditor
                html={html}
                editorState={undefined as unknown as EditorState}
                plugins={[] as Plugin[]}
            />,
        )

        expect(screen.getByText(html))
    })

    it('render bold text', () => {
        const html = 'this is <strong>bold</strong> text'
        render(
            <TestEditor
                html={html}
                editorState={undefined as unknown as EditorState}
                plugins={[] as Plugin[]}
            />,
        )

        expect(screen.getByText('bold'))
    })
})
