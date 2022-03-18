import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import {RepositionableImageUpload} from '../RepositionableImageUpload'

describe('<RepositionableImageUpload />', () => {
    const submitFn = jest.fn()
    const changeFn = jest.fn()
    const baseProps: React.ComponentProps<typeof RepositionableImageUpload> = {
        onSubmit: submitFn,
        inputRef: {
            current: null,
        },
        id: 'banner_image',
        title: 'Banner Background',
        info: 'info',
        onChangeFile: changeFn,
        isTouched: false,
        helpTextProps: {
            text: 'text',
            highlight: 'upload',
        },
        isSavingBannerImage: false,
    }
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('matches snapshot with preview', () => {
        const {container} = render(
            <RepositionableImageUpload
                {...baseProps}
                defaultPreview="imageUrl"
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('shows image and remove image if default preview and not touched', () => {
        const {getByText, getByAltText} = render(
            <RepositionableImageUpload
                {...baseProps}
                defaultPreview="imageUrl"
            />
        )

        getByText('Remove image')
        getByAltText('imageUrl')
    })

    it('does not show image nor remove image if no default preview', () => {
        const {getByText, queryByText, queryByAltText} = render(
            <RepositionableImageUpload {...baseProps} />
        )

        expect(queryByText('Remove image')).toBeNull()
        expect(queryByAltText('imageUrl')).toBeNull()
        getByText('Drop your image here, or')
    })

    it('does not show image if image is saving', () => {
        const {queryByAltText} = render(
            <RepositionableImageUpload
                {...baseProps}
                isSavingBannerImage
                defaultPreview="imageUrl"
            />
        )

        expect(queryByAltText('imageUrl')).toBeNull()
    })

    it('shows reposition button on mouse enter and hides it on mouse leave, and shows drag image on click', () => {
        const {getByText, queryByText, getByTestId} = render(
            <RepositionableImageUpload
                {...baseProps}
                defaultPreview="imageUrl"
            />
        )

        expect(queryByText('Reposition')).toBeNull()

        const draggableContainer = getByTestId('draggable-container')

        fireEvent.mouseEnter(draggableContainer)
        getByText('Reposition')
        fireEvent.mouseLeave(draggableContainer)
        expect(queryByText('Reposition')).toBeNull()

        fireEvent.mouseEnter(draggableContainer)
        fireEvent.click(getByText('Reposition'))

        getByText('Drag image to reposition')
    })
})
