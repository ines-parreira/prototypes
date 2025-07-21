import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import { DraggablePreviewImage } from '../DraggablePreviewImage'

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
        const { container } = render(<DraggablePreviewImage {...baseProps} />)

        expect(container).toMatchSnapshot()
    })

    it('does not show buttons if no repositioning in progress and no show action buttons', () => {
        const { queryByText } = render(<DraggablePreviewImage {...baseProps} />)

        expect(queryByText('Cancel')).toBeNull()
        expect(queryByText('Save Position')).toBeNull()
        expect(queryByText('Reposition')).toBeNull()
    })

    it('shows cancel and save position if repositioning in progress and submits on click', () => {
        const { getByText, queryByText } = render(
            <DraggablePreviewImage {...baseProps} repositioningInProgress />,
        )

        getByText('Cancel')
        getByText('Save Position')
        getByText('Drag image to reposition')
        expect(queryByText('Reposition')).toBeNull()

        fireEvent.click(getByText('Save Position'))
        expect(submitFn).toHaveBeenCalled()
    })

    it('transforms the defaultPreview value when it points to an older attachment bucket', async () => {
        const oldBucketAttachmentUrl =
            'https://uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png'

        const expectedUrl =
            'https://attachments.gorgias.help/uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png'

        const { findByAltText } = render(
            <DraggablePreviewImage
                {...baseProps}
                defaultPreview={oldBucketAttachmentUrl}
                repositioningInProgress
            />,
        )

        await findByAltText(expectedUrl)
    })
})
