import {fireEvent, render, waitFor} from '@testing-library/react'
import React from 'react'

import {FaviconUpload} from '../FaviconUpload'

describe('<FaviconUpload />', () => {
    const changeFileFn = jest.fn()
    const baseProps = {
        id: 'jest-file',
        title: 'Favicon',
        info: 'This is shown in each browser beside your website’s name.',
        HelpText: {
            text: 'Ideally a 64px square PNG',
        },
        onChangeFile: changeFileFn,
    }
    const dummyFile = new File(['favicon.png'], 'favicon.png', {
        type: 'image/png',
    })

    global.URL.createObjectURL = jest.fn()

    beforeEach(() => {
        changeFileFn.mockReset()
    })

    it('matches snapshot', () => {
        const {container} = render(<FaviconUpload {...baseProps} />)

        expect(container).toMatchSnapshot()
    })

    it('shows the defaultPreview only if the component is in untouched state', async () => {
        const {findByAltText, rerender} = render(
            <FaviconUpload {...baseProps} defaultPreview="preview.png" />
        )

        await findByAltText('preview.png')

        rerender(
            <FaviconUpload
                {...baseProps}
                isTouched
                file={dummyFile}
                defaultPreview="preview.png"
            />
        )

        await findByAltText('favicon.png')
    })

    it('calls the change file callback', async () => {
        const {getByTestId} = render(<FaviconUpload {...baseProps} />)

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
