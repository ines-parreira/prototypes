import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {CampaignTableStats} from './CampaignTableStats'

const storyConfig: Meta = {
    title: 'Data Display/CampaignTableStats',
    component: CampaignTableStats,
}

const Template: Story<ComponentProps<typeof CampaignTableStats>> = (props) => (
    <CampaignTableStats {...props} />
)

export const Default = Template.bind({})
Default.args = {
    rows: [
        {
            campaign: {
                id: '1234',
                name: 'Test campaign',
                is_light: false,
            },
            currency: 'USD',
            metrics: {
                conversionRate: 0.5,
            },
        },
    ],
    offset: 0,
    onClickNextPage: () => null,
    onClickPrevPage: () => null,
}

export default storyConfig
