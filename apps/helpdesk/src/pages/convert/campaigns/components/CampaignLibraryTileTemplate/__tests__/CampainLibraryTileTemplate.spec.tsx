import {
    CampaignTemplate,
    CampaignTemplateLabelType,
} from 'pages/convert/campaigns/templates/types'
import { renderWithRouter } from 'utils/testing'

import CampainLibraryTileTemplate from '../CampaignLibraryTileTemplate'

describe('CampaignLibraryTileTemplate', () => {
    const template: CampaignTemplate = {
        slug: 'test-slug',
        name: 'Test Campaign',
        description: 'Lorem ipsum...',
        preview: 'test-preview.jpg',
        onboarding: false,
        label: CampaignTemplateLabelType.IncreaseConversions,
        getConfiguration: jest.fn(),
    }

    it('renders campaign library template correctly', () => {
        const { getByText, getByAltText } = renderWithRouter(
            <CampainLibraryTileTemplate
                template={template}
                integrationId={1}
            />,
        )

        const campaignName = getByText(template.name)
        expect(campaignName).toBeInTheDocument()

        const campaignDescription = getByText(template.description ?? '')
        expect(campaignDescription).toBeInTheDocument()

        const campaignPreview = getByAltText(template.name)
        expect(campaignPreview).toHaveAttribute('src', template.preview)
    })
})
