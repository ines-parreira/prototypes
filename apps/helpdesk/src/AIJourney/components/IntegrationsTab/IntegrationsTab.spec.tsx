import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { useJourneyContext } from 'AIJourney/providers'

import { IntegrationsTab } from './IntegrationsTab'

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext = useJourneyContext as jest.Mock

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

beforeEach(() => {
    mockUseJourneyContext.mockReturnValue({ shopName: 'artemisathletix' })
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

    it('should render the Shopify card with a link to the AI Agent products page', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Shopify' }),
        ).toBeInTheDocument()

        const link = screen.getByRole('link', {
            name: /view product catalog in ai agent/i,
        })
        expect(link).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/artemisathletix/products',
        )
        expect(link).toHaveAttribute('target', '_blank')
    })

    it('should render a skeleton when isFormReady is false', () => {
        renderComponent(false)

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })
})
