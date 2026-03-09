import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { VoCSidePanel } from 'domains/reporting/pages/voice-of-customer/components/VoCSidePanel/VoCSidePanel'
import { SidePanelTab } from 'domains/reporting/state/ui/stats/sidePanelSlice'

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
