import type { Component } from 'react'

import { findDOMNode } from 'react-dom'

import * as utils from '../keyboard'

// Mock findDOMNode to control its return value
jest.mock('react-dom', () => ({
    findDOMNode: jest.fn(),
}))

// Mock scroll-into-view-if-needed
jest.mock('scroll-into-view-if-needed', () => ({
    __esModule: true,
    default: jest.fn(),
}))

describe('keyboard utils', () => {
    describe('moveIndex', () => {
        it('should return next index', () => {
            expect(utils.moveIndex(0, 2)).toEqual(1)
        })

        it('should return previous index', () => {
            expect(
                utils.moveIndex(1, 1, {
                    direction: utils.MoveIndexDirection.Prev,
                }),
            ).toEqual(0)
        })

        it('should return same index', () => {
            expect(utils.moveIndex(0, 0)).toEqual(0)
            expect(
                utils.moveIndex(0, 0, {
                    direction: utils.MoveIndexDirection.Prev,
                }),
            ).toEqual(0)
        })
    })

    describe('scrollToReactNode', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should return early when findDOMNode returns null', () => {
            const mockFindDOMNode = findDOMNode as jest.MockedFunction<
                typeof findDOMNode
            >
            mockFindDOMNode.mockReturnValue(null)

            const result = utils.scrollToReactNode({} as Component)

            expect(result).toBeUndefined()
            expect(mockFindDOMNode).toHaveBeenCalledWith({})
        })

        it('should return early when findDOMNode returns a Text node', () => {
            const mockFindDOMNode = findDOMNode as jest.MockedFunction<
                typeof findDOMNode
            >
            const textNode = document.createTextNode('test')
            mockFindDOMNode.mockReturnValue(textNode)

            const result = utils.scrollToReactNode({} as Component)

            expect(result).toBeUndefined()
            expect(mockFindDOMNode).toHaveBeenCalledWith({})
        })

        it('should call scrollToNode when findDOMNode returns a valid element', () => {
            const mockFindDOMNode = findDOMNode as jest.MockedFunction<
                typeof findDOMNode
            >
            const mockScrollIntoView = require('scroll-into-view-if-needed')
                .default as jest.MockedFunction<any>

            const divElement = document.createElement('div')
            const options = { block: 'center' as const }
            mockFindDOMNode.mockReturnValue(divElement)
            mockScrollIntoView.mockReturnValue('scroll-result')

            const result = utils.scrollToReactNode({} as Component, options)

            expect(mockFindDOMNode).toHaveBeenCalledWith({})
            expect(mockScrollIntoView).toHaveBeenCalledWith(divElement, {
                scrollMode: 'if-needed',
                block: 'center',
                inline: 'nearest',
            })
            expect(result).toBe('scroll-result')
        })
    })
})
