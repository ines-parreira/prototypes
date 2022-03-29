import {fireEvent, render} from '@testing-library/react'
import React, {createRef} from 'react'

import {ImageRepositioningModal} from '../ImageRepositioningModal'

describe('<ImageRepositioningModal />', () => {
    const closeModalFn = jest.fn()
    const submitFn = jest.fn()

    global.URL.createObjectURL = jest.fn()
    const dummyFile = new File(['image.png'], 'image.png', {
        type: 'image/png',
    })

    const bannerInputRef = createRef<HTMLInputElement>()

    const baseProps = {
        localImage: dummyFile,
        bannerInputRef: bannerInputRef,
        onCloseModal: closeModalFn,
        onSubmit: submitFn,
    }

    beforeEach(() => {
        closeModalFn.mockReset()
        submitFn.mockReset()
    })

    it('should call OnSubmit', () => {
        const {getByText} = render(<ImageRepositioningModal {...baseProps} />)

        const saveButton = getByText('Save Image')
        fireEvent.click(saveButton)

        expect(submitFn).toHaveBeenNthCalledWith(1, 0, false)
    })

    it('should call OnSubmit with batch mode', () => {
        const {getByText} = render(<ImageRepositioningModal {...baseProps} />)

        const batchApplyButton = getByText('Apply image to all languages')
        fireEvent.click(batchApplyButton)

        const saveButton = getByText('Save Image')
        fireEvent.click(saveButton)

        expect(submitFn).toHaveBeenNthCalledWith(1, 0, true)
    })

    it('should call onCloseModal', () => {
        const {getByText} = render(<ImageRepositioningModal {...baseProps} />)

        const cancelButton = getByText('Cancel')
        fireEvent.click(cancelButton)

        expect(closeModalFn).toHaveBeenCalled()
    })
})
