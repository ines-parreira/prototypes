import {fireEvent, render, waitFor} from '@testing-library/react'
import React from 'react'

import {ImageUpload} from '../ImageUpload'

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
        const {container} = render(<ImageUpload {...baseProps} />)

        expect(container).toMatchSnapshot()
    })

    it('shows the defaultPreview only if the component is in untouched state', async () => {
        const {findByAltText, rerender} = render(
            <ImageUpload {...baseProps} defaultPreview="preview.png" />
        )

        await findByAltText('preview.png')

        rerender(
            <ImageUpload
                {...baseProps}
                isTouched
                file={dummyFile}
                defaultPreview="preview.png"
            />
        )

        await findByAltText('image.png')
    })

    it('calls the change file callback', async () => {
        const {getByTestId} = render(<ImageUpload {...baseProps} />)

        const dropZone = getByTestId('dropZone')
        await waitFor(() =>
            fireEvent.drop(dropZone, {
                dataTransfer: {
                    items: [dummyFile],
                    files: [dummyFile],
                },
            })
        )

        expect(changeFileFn).toHaveBeenCalled()
    })
})
