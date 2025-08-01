import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render } from '@testing-library/react'

import useId from 'hooks/useId'

import useHandle from '../../hooks/useHandle'
import Handle from '../Handle'

import css from '../Handle.less'

jest.mock('hooks/useId', () => jest.fn())
const useIdMock = assumeMock(useId)

jest.mock('../../hooks/useHandle', () => jest.fn())
const useHandleMock = assumeMock(useHandle)

describe('Handle', () => {
    beforeEach(() => {
        useIdMock.mockReturnValue('123')
        useHandleMock.mockReturnValue({})
    })

    it('should call onResizeStart when the handle is pressed', () => {
        const onResizeStart = jest.fn()
        useIdMock.mockReturnValue('123')
        useHandleMock.mockReturnValue({ onResizeStart })

        const { container } = render(<Handle />)

        const el = container.firstChild!
        fireEvent.mouseDown(el)
        expect(el).toHaveAttribute('data-handle-id', '123')
        expect(onResizeStart).toHaveBeenCalled()
    })

    it('should hide the handle when there is no resize handle', () => {
        const { container } = render(<Handle />)
        const el = container.firstChild!
        expect(el).toHaveClass(css.isHidden)
    })
})
