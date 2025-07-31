import React from 'react'

import { userEvent } from '@repo/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import CurrentHelpCenterContext from '../../../../../contexts/CurrentHelpCenterContext'
import { getSingleHelpCenterResponseFixture } from '../../../../../fixtures/getHelpCentersResponse.fixture'
import { useFileUpload } from '../../../../../hooks/useFileUpload'
import { CategoryImageEdit, CategoryImageEditProps } from '../CategoryImageEdit'

window.URL.createObjectURL = jest.fn((file: File) => file.name) // avoid upload image error

type CategoryImageEditTestProps = Omit<CategoryImageEditProps, 'imageFile'>
const Example = (props: CategoryImageEditTestProps) => {
    const imageFile = useFileUpload()
    return <CategoryImageEdit imageFile={imageFile} {...props} />
}

const renderComponent = (props: Partial<CategoryImageEditTestProps>) => {
    return render(
        <Example
            onImageChanged={jest.fn()}
            onRemoveImage={jest.fn()}
            currentImageUrl=""
            {...props}
        />,
        {
            wrapper: ({ children }) => (
                <CurrentHelpCenterContext.Provider
                    value={getSingleHelpCenterResponseFixture}
                >
                    {children}
                </CurrentHelpCenterContext.Provider>
            ),
        },
    )
}

const dummyFile = new File(['image.png'], 'image.png', {
    type: 'image/png',
})

const uploadImage = async (dummyFile: File) => {
    const dropZone = screen.getByLabelText('Drop zone files')
    await waitFor(() =>
        fireEvent.drop(dropZone, {
            dataTransfer: {
                items: [dummyFile],
                files: [dummyFile],
            },
        }),
    )
}

describe('<CategoryImageEdit />', () => {
    it('should render component with default state', () => {
        const { container } = renderComponent({})

        expect(container).toMatchSnapshot()
    })

    it('should show default image when image not uploaded', () => {
        const testImgUrl = '/image.png'
        renderComponent({
            currentImageUrl: testImgUrl,
        })

        expect(screen.getByTestId('image-upload-preview')).toHaveAttribute(
            'src',
            testImgUrl,
        )
    })

    it('should use custom image when user upload the image', async () => {
        const testImgUrl = '/image.png'
        renderComponent({
            currentImageUrl: testImgUrl,
        })

        await uploadImage(dummyFile)

        await waitFor(() =>
            expect(
                screen.getByTestId('image-upload-locale-image'),
            ).toBeInTheDocument(),
        )

        expect(screen.getByTestId('image-upload-locale-image')).toHaveAttribute(
            'src',
            dummyFile.name,
        )
    })

    it('should remove image when clicked on "Remove Image" button', async () => {
        const testImgUrl = '/image.png'
        renderComponent({
            currentImageUrl: testImgUrl,
        })

        await uploadImage(dummyFile)

        expect(screen.getByTestId('image-upload-locale-image')).toHaveAttribute(
            'src',
            dummyFile.name,
        )

        act(() => {
            userEvent.click(screen.getByText('Remove image'))
        })

        expect(screen.getByText('Upload image')).toBeInTheDocument()
        expect(
            screen.queryByTestId('image-upload-locale-image'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('image-upload-preview-image'),
        ).not.toBeInTheDocument()
    })
})
