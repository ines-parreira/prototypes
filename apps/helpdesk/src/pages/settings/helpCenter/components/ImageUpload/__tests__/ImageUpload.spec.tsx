import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ImageUpload } from '../ImageUpload'

describe('<ImageUpload />', () => {
    const changeFileFn = jest.fn()
    const baseProps = {
        id: 'jest-file',
        title: 'Standard Logo',
        info: 'Used in the main navigation when with the light theme.',
        HelpText: {
            highlight: 'Replace image',
            text: 'recommended size 1640 x 624',
        },
        onChangeFile: changeFileFn,
    }
    const dummyFile = new File(['image.png'], 'image.png', {
        type: 'image/png',
    })

    global.URL.createObjectURL = jest.fn()

    beforeEach(() => {
        changeFileFn.mockReset()
    })

    it('matches snapshot', () => {
        const { container } = render(<ImageUpload {...baseProps} />)

        expect(container).toMatchSnapshot()
    })

    it('shows the defaultPreview only if the component is in untouched state', async () => {
        const { rerender } = render(
            <ImageUpload {...baseProps} defaultPreview="preview.png" />,
        )

        await screen.findByAltText('preview.png')

        rerender(
            <ImageUpload
                {...baseProps}
                isTouched
                file={dummyFile}
                defaultPreview="preview.png"
            />,
        )

        await screen.findByAltText('image.png')
    })

    it('transforms the defaultPreview value when it points to an older attachment bucket', async () => {
        const oldBucketAttachmentUrl =
            'https://uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png'

        const expectedUrl =
            'https://attachments.gorgias.help/uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png'

        render(
            <ImageUpload
                {...baseProps}
                isTouched={false}
                defaultPreview={oldBucketAttachmentUrl}
            />,
        )

        await screen.findByAltText(expectedUrl)
    })

    it('calls the change file callback', async () => {
        render(<ImageUpload {...baseProps} />)

        const dropZone = screen.getByLabelText('Drop zone files')

        await waitFor(() =>
            fireEvent.drop(dropZone, {
                dataTransfer: {
                    items: [dummyFile],
                    files: [dummyFile],
                },
            }),
        )

        expect(changeFileFn).toHaveBeenCalled()
    })
})
