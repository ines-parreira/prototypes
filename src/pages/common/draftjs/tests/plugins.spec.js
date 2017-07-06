import React from 'react'
import renderer from 'react-test-renderer'
import {ContentState} from 'draft-js'

import * as utils from './utils'

import TestEditor from './TestEditor'

import {convertFromHTML} from '../../../../utils'

import createToolbarPlugin from '../plugins/toolbar'
import {
    variable as variableDecorator,
    link as linkDecorator,
    foundUrl as foundUrlDecorator
} from '../plugins/toolbar/decorators'
import {attachImmutableEntitiesToVariables} from '../plugins/toolbar/utils'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('DraftJS convertToHtml', () => {
    it('no decorator should not find any entity', () => {
        const composite = utils.getCompositeDecorator()
        const html = 'this is text only'
        const content = convertFromHTML(html).getBlockMap().first()
        const decorations = composite.getDecorations(content).toArray()

        expect(decorations.length).toBe(html.length)
        expect(decorations).toEqual(Array(html.length).fill(null))
    })

    it('link entity in html', () => {
        const composite = utils.getCompositeDecorator(linkDecorator)
        const html = 'a url <a href="http://google.com">link</a> and <a href="http://google.com">link</a>'
        const text = 'a url link and link'
        const positions = [{start: 6, length: 4}, {start: 15, length: 4}]

        const content = convertFromHTML(html).getBlockMap().first()
        const decorations = composite.getDecorations(content).toArray()

        expect(decorations.length).toBe(text.length)
        expect(content.getText()).toEqual(text)

        positions.forEach((position, index) => {
            const {start, length} = position
            const end = start + length - 1
            const begin = index > 0 ? positions[index - 1].start + positions[index - 1].length : 0
            expect(utils.isEntirelyNull(decorations.slice(begin, start))).toBe(true)
            expect(utils.isOccupied(decorations.slice(start, length))).toBe(true)
            expect(decorations[start]).toEqual(decorations[end])
            expect(composite.getComponentForKey(decorations[start])).toBe(linkDecorator.component)
        })
    })
})

describe('DraftJS display entities', () => {
    it('link found in text', () => {
        const composite = utils.getCompositeDecorator(foundUrlDecorator)
        const text = 'url http://google.com'
        const positions = [{start: 4, length: 17}]

        const content = convertFromHTML(text).getBlockMap().first()
        const decorations = composite.getDecorations(content).toArray()

        expect(decorations.length).toBe(text.length)
        expect(content.getText()).toEqual(text)

        positions.forEach((position, index) => {
            const {start, length} = position
            const end = start + length - 1
            const begin = index > 0 ? positions[index - 1].start + positions[index - 1].length : 0
            expect(utils.isEntirelyNull(decorations.slice(begin, start))).toBe(true)
            expect(utils.isOccupied(decorations.slice(start, length))).toBe(true)
            expect(decorations[start]).toEqual(decorations[end])
            expect(composite.getComponentForKey(decorations[start])).toBe(foundUrlDecorator.component)
        })
    })

    it('variable entity in text', () => {
        const composite = utils.getCompositeDecorator(variableDecorator)
        const text = 'variable {current_user.name} and {ticket.requester.email}'
        let editorState = utils.editorStateFromHtml(text)
        editorState = attachImmutableEntitiesToVariables(editorState)
        const positions = [{start: 9, length: 19}, {start: 33, length: 24}]

        const content = editorState.getCurrentContent().getBlockMap().first()
        const decorations = composite.getDecorations(content).toArray()

        expect(decorations.length).toBe(text.length)
        expect(content.getText()).toEqual(text)

        positions.forEach((position, index) => {
            const {start, length} = position
            const end = start + length - 1
            const begin = index > 0 ? positions[index - 1].start + positions[index - 1].length : 0
            expect(utils.isEntirelyNull(decorations.slice(begin, start))).toBe(true)
            expect(utils.isOccupied(decorations.slice(start, length))).toBe(true)
            expect(decorations[start]).toEqual(decorations[end])
            expect(composite.getComponentForKey(decorations[start])).toBe(variableDecorator.component)
        })
    })
})

describe('DraftJS decorators', () => {
    it('find url in text', () => {
        const composite = utils.getCompositeDecorator(foundUrlDecorator)
        const text = 'find a url http://google.com'
        const content = ContentState.createFromText(text).getBlockMap().first()
        const decorations = composite.getDecorations(content).toArray()

        expect(decorations[2]).toEqual(decorations[4])
    })
})

describe('DraftJS Plugins', () => {
    it('render simple text', () => {
        const html = 'this is only text, no style'
        const component = renderer.create(
            <TestEditor
                html={html}
            />
        )
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
    })

    it('render bold text', () => {
        const html = 'this is <strong>bold</strong> text'
        const component = renderer.create(
            <TestEditor
                html={html}
            />
        )
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
    })

    it('render link found in text', () => {
        const html = 'this is a url <a href="http://google.com">link</a>'
        let editorState = utils.editorStateFromHtml(html)

        const toolbarPlugin = createToolbarPlugin()

        const plugins = [
            toolbarPlugin,
        ]

        const component = renderer.create(
            <TestEditor
                editorState={editorState}
                plugins={plugins}
            />
        )
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
    })

    // it('render variable', () => {
    //     const html = 'variable {current_user.name}'
    //     let editorState = utils.editorStateFromHtml(html)
    //
    //     const toolbarPlugin = createToolbarPlugin()
    //
    //     const plugins = [
    //         toolbarPlugin,
    //     ]
    //
    //     editorState = utils.applyPluginsToEditorState(editorState, plugins)
    //
    //     const component = renderer.create(
    //         <TestEditor
    //             editorState={editorState}
    //             plugins={plugins}
    //         />
    //     )
    //     const tree = component.toJSON()
    //     expect(tree).toMatchSnapshot()
    // })
})
