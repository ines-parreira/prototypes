import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { IntegrationsTab } from './IntegrationsTab'

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

const renderComponent = (isFormReady = true) => {
    const Wrapper = () => {
        const methods = useForm({
            defaultValues: { klaviyo_api_key: null },
        })
        return (
            <FormProvider {...methods}>
                <IntegrationsTab isFormReady={isFormReady} />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<IntegrationsTab />', () => {
    it('should render the Klaviyo card', () => {
        renderComponent()

        expect(screen.getByText('Klaviyo')).toBeInTheDocument()
    })

    it('should render a skeleton when isFormReady is false', () => {
        renderComponent(false)

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })
})
