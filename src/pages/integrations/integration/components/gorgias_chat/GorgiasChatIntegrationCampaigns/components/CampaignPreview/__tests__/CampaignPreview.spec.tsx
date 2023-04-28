import React from 'react'
import {render} from '@testing-library/react'

import {GorgiasChatPositionAlignmentEnum} from 'models/integration/types'

import CampaignPreview from '../CampaignPreview'

const CAMPAIGN_POSITION = {
    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
    offsetX: 0,
    offsetY: 0,
}

const TEXTS = {
    campaignClickToReply: 'Click to reply',
}

describe('<CampaignPreview />', () => {
    it('renders the campaign message', () => {
        const {getByText} = render(
            <CampaignPreview
                html="<div>Jest campaign</div>"
                mainColor="#0d87dd"
                mainFontFamily="Inter"
                translatedTexts={TEXTS}
                position={CAMPAIGN_POSITION}
            />
        )

        getByText('Jest campaign')
    })

    it('renders the Click to reply if campaign is interactive', () => {
        const {getByText} = render(
            <CampaignPreview
                html="<div>Jest campaign</div>"
                mainColor="#0d87dd"
                mainFontFamily="Inter"
                translatedTexts={TEXTS}
                position={CAMPAIGN_POSITION}
            />
        )

        getByText('Click to reply')
    })

    it('does not render the Click to reply if campaign is not interactive', () => {
        const {queryByText} = render(
            <CampaignPreview
                html="<div>Jest campaign</div>"
                mainColor="#0d87dd"
                mainFontFamily="Inter"
                translatedTexts={TEXTS}
                position={CAMPAIGN_POSITION}
                shouldHideReplyInput={true}
            />
        )

        expect(queryByText('Click to reply')).toBeNull()
    })
})
