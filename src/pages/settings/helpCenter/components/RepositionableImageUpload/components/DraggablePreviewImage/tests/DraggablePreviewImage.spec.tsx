import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import {DraggablePreviewImage} from '../DraggablePreviewImage'

describe('<DraggablePreviewImage />', () => {
    const submitFn = jest.fn()
    const baseProps: React.ComponentProps<typeof DraggablePreviewImage> = {
        onSubmit: submitFn,
        repositioningInProgress: false,
        setRepositioningInProgress: jest.fn(),
        offset: 0,
        setOffset: jest.fn(),
        showActionButtons: false,
        setShowActionButtons: jest.fn(),
    }
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('matches snapshot', () => {
        const {container} = render(<DraggablePreviewImage {...baseProps} />)

        expect(container).toMatchSnapshot()
    })

    it('does not show buttons if no repositioning in progress and no show action buttons', () => {
        const {queryByText} = render(<DraggablePreviewImage {...baseProps} />)

        expect(queryByText('Cancel')).toBeNull()
        expect(queryByText('Save Position')).toBeNull()
        expect(queryByText('Reposition')).toBeNull()
    })

    it('shows cancel and save position if repositioning in progress and submits on click', () => {
        const {getByText, queryByText} = render(
            <DraggablePreviewImage {...baseProps} repositioningInProgress />
        )

        getByText('Cancel')
        getByText('Save Position')
        getByText('Drag image to reposition')
        expect(queryByText('Reposition')).toBeNull()

        fireEvent.click(getByText('Save Position'))
        expect(submitFn).toHaveBeenCalled()
    })
})
