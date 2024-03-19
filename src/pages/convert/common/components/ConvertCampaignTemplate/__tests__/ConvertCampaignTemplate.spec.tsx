import React from 'react'
import {render} from '@testing-library/react'
import {CampaignTemplate} from 'pages/convert/campaigns/templates/types'
import ConvertCampaignTemplate from '../ConvertCampaignTemplate'

describe('ConvertCampaignTemplate', () => {
    const template = {
        slug: 'test-slug',
        name: 'Test Campaign',
        preview: 'test-preview.jpg',
        label: 'Increase Conversions',
        onboarding: true,
        getConfiguration: jest.fn(),
    } as CampaignTemplate

    it('renders campaign template correctly', () => {
        const {getByText, getByAltText} = render(
            <ConvertCampaignTemplate
                template={template}
                integrationId={1}
                selected={true}
            />
        )

        const campaignLabel = getByText(template.label)
        expect(campaignLabel).toBeInTheDocument()

        const campaignName = getByText(template.name)
        expect(campaignName).toBeInTheDocument()

        const campaignPreview = getByAltText(template.name)
        expect(campaignPreview).toHaveAttribute('src', template.preview)

        const customizeButton = getByText('Customize')
        expect(customizeButton).toBeInTheDocument()
    })
})
