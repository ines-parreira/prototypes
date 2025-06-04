import React, { ComponentProps } from 'react'

import { Meta, StoryFn } from '@storybook/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { VoCSidePanel } from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel'
import { SidePanelTab } from 'state/ui/stats/sidePanelSlice'

const mockStore = configureMockStore()

const store = mockStore({
    ui: {
        stats: {
            sidePanel: {
                isOpen: true,
                productId: null,
                activeTab: SidePanelTab.Insights,
            },
        },
    },
})

const storyConfig: Meta = {
    title: 'Stats/VoiceOfCustomer/VoCSidePanel',
    component: VoCSidePanel,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
    decorators: [
        (Story) => (
            <Provider store={store}>
                <Story />
            </Provider>
        ),
    ],
}

const Template: StoryFn<ComponentProps<typeof VoCSidePanel>> = () => (
    <VoCSidePanel />
)

export const Default = Template.bind({})

export default storyConfig
