import {fireEvent, render, waitFor} from '@testing-library/react'
import React from 'react'

import {DropdownCSVImportDropZone} from '../DropdownCSVImportDropZone'

const props = {
    file: null,
    setFile: jest.fn(),
}

describe('<DropdownCSVImportDropZone/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render without file', () => {
        const {container} = render(<DropdownCSVImportDropZone {...props} />)
        expect(container).toMatchSnapshot()
    })

    it('should render with a file', () => {
        const file = new File(['contents'], 'file.csv', {type: 'text/csv'})
        const {container} = render(
            <DropdownCSVImportDropZone {...props} file={file} />
        )
        expect(container).toMatchSnapshot()
    })

    it('should call setFile() when dropping a file on it', async () => {
        const {getByText} = render(<DropdownCSVImportDropZone {...props} />)

        const dropZone = getByText('Drop your CSV here, or')
        const file = new File(['contents'], 'file.csv', {type: 'text/csv'})
        const dummyFile = {getAsFile: () => file}
        await waitFor(() =>
            fireEvent.drop(dropZone, {
                dataTransfer: {
                    items: [dummyFile],
                    files: [dummyFile],
                },
            })
        )

        expect(props.setFile).toHaveBeenCalledWith(file)
    })
})
