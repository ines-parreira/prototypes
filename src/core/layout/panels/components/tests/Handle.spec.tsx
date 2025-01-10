import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import Handle from '../Handle'

describe('Handle', () => {
    it('should call onResizeStart when the handle is pressed', () => {
        const onResizeStart = jest.fn()
        const {container} = render(<Handle onResizeStart={onResizeStart} />)
        fireEvent.mouseDown(container.firstChild!)
        expect(onResizeStart).toHaveBeenCalled()
    })
})
