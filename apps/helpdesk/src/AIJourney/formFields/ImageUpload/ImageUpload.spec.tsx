import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { ImageUpload } from './ImageUpload'

jest.mock('AIJourney/components/ImageDropzone/ImageDropzone', () => ({
    ImageDropzone: ({
        hideLabel,
        fullWidth,
    }: {
        hideLabel?: boolean
        fullWidth?: boolean
    }) => (
        <div>
            ImageDropzone
            {hideLabel ? ':hideLabel' : ''}
            {fullWidth ? ':fullWidth' : ''}
        </div>
    ),
}))

const renderComponent = (
    props: { hideLabel?: boolean; fullWidth?: boolean } = {},
) => {
    const Wrapper = () => {
        const methods = useForm()
        return (
            <FormProvider {...methods}>
                <ImageUpload {...props} />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<ImageUpload />', () => {
    it('renders ImageDropzone with default props', () => {
        renderComponent()

        expect(screen.getByText('ImageDropzone')).toBeInTheDocument()
    })

    it('forwards hideLabel and fullWidth props to ImageDropzone', () => {
        renderComponent({ hideLabel: true, fullWidth: true })

        expect(
            screen.getByText('ImageDropzone:hideLabel:fullWidth'),
        ).toBeInTheDocument()
    })
})
