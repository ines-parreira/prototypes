import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import ActionsPlatformTemplatesFilters from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplatesFilters'
import {IntegrationType} from 'models/integration/constants'

const storyConfig: Meta = {
    title: 'General/ActionsPlatformTemplatesFilters',
    component: ActionsPlatformTemplatesFilters,
}

const TemplateAction: Story<
    ComponentProps<typeof ActionsPlatformTemplatesFilters>
> = () => {
    return (
        <ActionsPlatformTemplatesFilters
            app={{
                id: 'id',
                name: 'name',
                icon: 'icon',
                type: IntegrationType.Shopify,
            }}
            apps={[
                {
                    id: 'id',
                    name: 'name',
                    icon: 'icon',
                    type: IntegrationType.Shopify,
                },
            ]}
            name="NameOne"
            onAppChange={() => {}}
            onNameChange={() => {}}
        />
    )
}

export const Test = TemplateAction.bind({})

export default storyConfig
