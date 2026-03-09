import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { IntegrationType } from 'models/integration/constants'
import ActionsPlatformTemplatesFilters from 'pages/automate/actionsPlatform/components/ActionsPlatformTemplatesFilters'

const storyConfig: Meta = {
    title: 'General/ActionsPlatformTemplatesFilters',
    component: ActionsPlatformTemplatesFilters,
}

const TemplateAction: StoryObj<
    ComponentProps<typeof ActionsPlatformTemplatesFilters>
> = {
    render: function TemplateAction() {
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
    },
}

export const Test = {
    ...TemplateAction,
}

export default storyConfig
