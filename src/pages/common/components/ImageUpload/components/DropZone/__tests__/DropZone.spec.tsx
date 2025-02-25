import React from 'react'

import { createEvent, fireEvent, render, screen } from '@testing-library/react'

import { DropText } from '../../DropText'
import { DropZone } from '../DropZone'

describe('<DropZone>', () => {
    const onDragInFn = jest.fn()
    const onDragOutFn = jest.fn()
    const onDropFn = jest.fn()

    const acceptedFile = new File([''], 'image.png', {
        type: 'image/png',
    })

    const rejectedFile = new File([''], 'document.pdf', {
        type: 'application/pdf',
    })

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('matches snapshot', () => {
        const { container } = render(
            <DropZone id="dropZone">
                <DropText />
            </DropZone>,
        )

        expect(container).toMatchSnapshot()
    })

    it('calls the right in and out handlers', () => {
        render(
            <DropZone
                accept="image/png"
                id="dropZone"
                onDragIn={onDragInFn}
                onDragOut={onDragOutFn}
            >
                <DropText />
            </DropZone>,
        )
        const dropZone = screen.getByLabelText('Drop zone files')
        const mockedDragEnterEvent = createEvent.dragEnter(dropZone)
        const mockedDragLeaveEvent = createEvent.dragLeave(dropZone)

        expect(onDragInFn).not.toHaveBeenCalled()
        expect(onDragOutFn).not.toHaveBeenCalled()

        fireEvent.dragEnter(dropZone, mockedDragEnterEvent)
        expect(onDragInFn).toHaveBeenCalledTimes(1)
        expect(onDragOutFn).not.toHaveBeenCalled()

        fireEvent.dragLeave(dropZone, mockedDragLeaveEvent)
        expect(onDragInFn).toHaveBeenCalledTimes(1)
        expect(onDragOutFn).toHaveBeenCalledTimes(1)
    })

    it('calls the onDrop handler if file is accepted', () => {
        const { rerender } = render(
            <DropZone accept="image/png" id="dropZone" onDrop={onDropFn}>
                <DropText />
            </DropZone>,
        )
        const dropZone = screen.getByLabelText('Drop zone files')

        expect(onDropFn).not.toHaveBeenCalled()

        fireEvent.drop(dropZone, {
            dataTransfer: {
                items: [rejectedFile],
            },
        })
        expect(onDropFn).not.toHaveBeenCalled()

        fireEvent.drop(dropZone, {
            dataTransfer: {
                items: [acceptedFile],
            },
        })
        expect(onDropFn).toHaveBeenCalledTimes(1)

        // Reset the mock and try to drop files without restrictions
        onDropFn.mockReset()
        rerender(
            <DropZone id="dropZone" onDrop={onDropFn}>
                <DropText />
            </DropZone>,
        )
        expect(onDropFn).not.toHaveBeenCalled()

        fireEvent.drop(dropZone, {
            dataTransfer: {
                items: [rejectedFile],
            },
        })
        expect(onDropFn).toHaveBeenCalledTimes(1)

        fireEvent.drop(dropZone, {
            dataTransfer: {
                items: [acceptedFile],
            },
        })
        expect(onDropFn).toHaveBeenCalledTimes(2)
    })
})
