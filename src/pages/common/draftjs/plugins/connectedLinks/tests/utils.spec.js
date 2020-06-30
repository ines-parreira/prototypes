import {EditorState} from 'draft-js'
import {convertFromHTML} from 'draft-convert'

import {setConnectedLinks, parseUrl} from '../utils'

describe('Connected Links utils', () => {
    describe('parseUrl', () => {
        it('should always have trailing slash', () => {
            expect(parseUrl('http://gorgias.io')).toBe('http://gorgias.io/')
            expect(parseUrl('http://gorgias.io/')).toBe('http://gorgias.io/')
        })

        it('should match protocol', () => {
            expect(parseUrl('http://gorgias.io', 'https://gorgias.io')).toBe(
                'https://gorgias.io/'
            )
            expect(parseUrl('https://gorgias.io', 'http://gorgias.io')).toBe(
                'http://gorgias.io/'
            )
            expect(parseUrl('gorgias.io', 'https://gorgias.io')).toBe(
                'https://gorgias.io/'
            )
        })

        it('should add www subdomain', () => {
            expect(parseUrl('http://gorgias.io', 'http://www.gorgias.io')).toBe(
                'http://www.gorgias.io/'
            )
        })

        it('should transform protocol and www', () => {
            expect(
                parseUrl('http://gorgias.io', 'https://www.gorgias.io')
            ).toBe('https://www.gorgias.io/')
        })

        it('should not mimic other protocols', () => {
            expect(parseUrl('http://gorgias.io', 'ftp://gorgias.io')).toBe(
                'http://gorgias.io/'
            )
        })

        it('should not mimic other subdomains', () => {
            expect(
                parseUrl('http://gorgias.io', 'http://pizza.gorgias.io')
            ).toBe('http://gorgias.io/')
        })
    })

    describe('setConnectedLinks', () => {
        it('should transform link into connected link', () => {
            let editorState = EditorState.createWithContent(
                convertFromHTML({
                    htmlToEntity: (nodeName, node, createEntity) => {
                        if (nodeName === 'a') {
                            return createEntity('link', 'MUTABLE', {
                                url: node.href,
                            })
                        }
                    },
                })('<a href="https://gorgias.io/">https://gorgias.io/</a>')
            )

            editorState = setConnectedLinks(editorState)
            const contentState = editorState.getCurrentContent()
            const entityKey = contentState.getLastCreatedEntityKey()

            expect(contentState.getEntity(entityKey).getData().connected).toBe(
                true
            )
        })

        it('should transform link without protocol into connected link', () => {
            let editorState = EditorState.createWithContent(
                convertFromHTML({
                    htmlToEntity: (nodeName, node, createEntity) => {
                        if (nodeName === 'a') {
                            return createEntity('link', 'MUTABLE', {
                                url: node.href,
                            })
                        }
                    },
                })('<a href="https://gorgias.io/">gorgias.io</a>')
            )

            editorState = setConnectedLinks(editorState)
            const contentState = editorState.getCurrentContent()
            const entityKey = contentState.getLastCreatedEntityKey()

            expect(contentState.getEntity(entityKey).getData().connected).toBe(
                true
            )
        })

        it('should transform link without www and protocol into connected link', () => {
            let editorState = EditorState.createWithContent(
                convertFromHTML({
                    htmlToEntity: (nodeName, node, createEntity) => {
                        if (nodeName === 'a') {
                            return createEntity('link', 'MUTABLE', {
                                url: node.href,
                            })
                        }
                    },
                })('<a href="https://www.gorgias.io/">gorgias.io</a>')
            )

            editorState = setConnectedLinks(editorState)
            const contentState = editorState.getCurrentContent()
            const entityKey = contentState.getLastCreatedEntityKey()

            expect(contentState.getEntity(entityKey).getData().connected).toBe(
                true
            )
        })
    })
})
