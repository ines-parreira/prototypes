import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {GorgiasChatPositionAlignmentEnum} from 'models/integration/types/gorgiasChat'

import CampaignPreview from './CampaignPreview'

const storyConfig: Meta = {
    title: 'Data Display/Chat Campaigns/Preview',
    component: CampaignPreview,
    argTypes: {
        mainColor: {
            control: {
                type: 'color',
            },
        },
    },
    args: {
        authorName: 'John Doe',
        authorAvatarUrl:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2_Ku6shBAMjN4XlJnYYR4uCD-is3Gw4wRAg&usqp=CAU',
        mainColor: '#0097ff',
        html: `Hello, first-time visitor! 👋 <br><br> Thank you for shopping with us, we'd like to offer you free shipping 🚢, please use the code: <strong>FREE_SHIPPING</strong>`,
        position: {
            alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
            offsetX: 0,
            offsetY: 0,
        },
        translatedTexts: {
            campaignClickToReply: 'Click to reply',
            poweredBy: 'Powered by',
        },
    },
}

const Template: Story<ComponentProps<typeof CampaignPreview>> = (props) => (
    <CampaignPreview {...props} />
)

export const Primary = Template.bind({})

export const WithProducts = Template.bind({})
WithProducts.args = {
    products: [
        {
            id: 1,
            title: `Gibson ES-335 Sunburst 1970`,
            price: 8289,
            url: '',
            currency: 'usd',
            featured_image:
                'https://cdn.shopify.com/s/files/1/0343/4368/2183/products/gibson-electric-guitars-semi-hollow-gibson-es-335-sunburst-1968-u3877433902-29229399769223_2000x.jpg?v=1652315363',
        },
        {
            id: 2,
            title: `Gator TSA ATA Molded Les Paul Electric Guitar Case`,
            price: 469.98,
            url: '',
            currency: 'usd',
            featured_image:
                'https://cdn.shopify.com/s/files/1/0343/4368/2183/products/gator-accessories-cases-and-gig-bags-guitar-cases-gator-tsa-ata-molded-les-paul-electric-guitar-case-gtsa-gtrlps-29364584382599_2000x.jpg?v=1657220180',
        },
        {
            id: 3,
            title: `Fender George Harrison All Things Must Pass Pick Tin Set of 6`,
            price: 11.99,
            url: '',
            currency: 'usd',
            featured_image:
                'https://cdn.shopify.com/s/files/1/0343/4368/2183/products/fender-accessories-picks-fender-george-harrison-all-things-must-pass-pick-tin-set-of-6-1980351046-29707897176199_2000x.jpg?v=1663347561',
        },
        {
            id: 4,
            currency: 'usd',
            url: '',
            featured_image:
                'https://cdn.mos.cms.futurecdn.net/gPvyaz76tASn87RCGuSdDc.jpg',
            price: 1234.43,
            title: 'MacBook Air with M1 chip',
        },
    ],
}

export const VideoEmbedded = Template.bind({})
VideoEmbedded.args = {
    html: `<div>here is an image below</div><div><br /></div><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmcdHNojpj5mzs9E-WWvoyLJ6Bqul4t8zlxVS5Kwa3X0Vgy6jLr8VUaxVMIWE1ain5ttk&amp;usqp=CAU" width="400" style="max-width: 100%" /><div><br /></div><div>Then a video</div><div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="400"></div><div><br /></div><div>And a href <a href="https://gorgias.com/" target="_blank" rel="noreferrer noopener">HERE</a></div><div><br /></div>`,
}

export default storyConfig
