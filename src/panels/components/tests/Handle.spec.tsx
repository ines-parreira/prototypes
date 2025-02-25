import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import Handle from '../Handle'

describe('Handle', () => {
    it('should call the onResizeStart function on mousedown', () => {
        const onResizeStart = jest.fn()
        const { container } = render(<Handle onResizeStart={onResizeStart} />)

        fireEvent.mouseDown(container.firstChild as Element)
        expect(onResizeStart).toHaveBeenCalled()
    })
})
