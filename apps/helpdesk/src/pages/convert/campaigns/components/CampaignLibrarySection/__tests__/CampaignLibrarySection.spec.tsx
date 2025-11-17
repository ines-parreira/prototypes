import type { CampaignTemplateSectionType } from 'pages/convert/campaigns/templates/types'
import { CampaignTemplateLabelType } from 'pages/convert/campaigns/templates/types'
import { renderWithRouter } from 'utils/testing'

import CampaignLibrarySection from '../CampaignLibrarySection'

describe('CampaignLibrarySection', () => {
    const sectionTemplate: CampaignTemplateSectionType = {
        title: 'Test Section',
        description: 'Lorem Ipsum',
        templates: [
            {
                slug: 'test-slug',
                name: 'Test Campaign',
                preview: 'test-preview.jpg',
                onboarding: false,
                label: CampaignTemplateLabelType.IncreaseConversions,
                getConfiguration: jest.fn(),
            },
        ],
    }

    it('renders campaign template correctly', () => {
        const { getByText } = renderWithRouter(
            <CampaignLibrarySection
                section={sectionTemplate}
                integrationId={1}
            />,
        )

        const campaignName = getByText(sectionTemplate.title)
        expect(campaignName).toBeInTheDocument()

        const campaignTileTitle = getByText(sectionTemplate.templates[0].name)
        expect(campaignTileTitle).toBeInTheDocument()
    })
})
