import React from 'react'

import {render, act, fireEvent} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'

import useKey from '../useKey'

describe('useKey', () => {
    it('should call the provided handler when the specified key is pressed on the target element', () => {
        const mockHandler = jest.fn()
        const {getByTestId} = render(<div data-testid="test-div" />)
        const targetDiv = getByTestId('test-div')

        renderHook(() => useKey('Enter', mockHandler, {target: targetDiv}))

        act(() => {
            fireEvent.keyDown(targetDiv, {key: 'Enter'})
        })

        expect(mockHandler).toHaveBeenCalledWith(
            expect.objectContaining({key: 'Enter'})
        )
    })

    it('should not react to the event if the key is pressed outside the target element', () => {
        const mockHandler = jest.fn()
        const {getByTestId} = render(<div data-testid="test-div" />)
        const targetDiv = getByTestId('test-div')

        renderHook(() => useKey('Enter', mockHandler, {target: targetDiv}))

        act(() => {
            fireEvent.keyDown(document, {key: 'Enter'})
        })

        expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should not call the handler when a different key is pressed', () => {
        const mockHandler = jest.fn()
        render(<div />)

        renderHook(() => useKey('Enter', mockHandler))

        act(() => {
            fireEvent.keyDown(document, {key: 'Escape'})
        })

        expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should support custom key filter function', () => {
        const mockHandler = jest.fn()
        render(<div />)

        const keyFilter = (event: KeyboardEvent) =>
            ['A', 'B'].includes(event.key)
        renderHook(() => useKey(keyFilter, mockHandler))

        act(() => {
            fireEvent.keyDown(document, {key: 'A'})
            fireEvent.keyDown(document, {key: 'B'})
        })

        expect(mockHandler.mock.calls).toEqual([
            [expect.objectContaining({key: 'A'})],
            [expect.objectContaining({key: 'B'})],
        ])
    })

    it('should handle changing the key dynamically', () => {
        const mockHandler = jest.fn()
        render(<div />)

        const {rerender} = renderHook(({keys}) => useKey(keys, mockHandler), {
            initialProps: {keys: 'Enter'},
        })

        act(() => {
            fireEvent.keyDown(document, {key: 'Enter'})
        })

        expect(mockHandler).toHaveBeenCalledWith(
            expect.objectContaining({key: 'Enter'})
        )

        act(() => {
            rerender({keys: 'Escape'})
        })

        act(() => {
            fireEvent.keyDown(document, {key: 'Escape'})
        })

        expect(mockHandler.mock.calls).toEqual([
            [expect.objectContaining({key: 'Enter'})],
            [expect.objectContaining({key: 'Escape'})],
        ])
    })
})
