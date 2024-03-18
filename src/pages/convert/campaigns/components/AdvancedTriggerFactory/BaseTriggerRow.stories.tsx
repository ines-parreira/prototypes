import {Meta, StoryObj} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'
import {createTrigger} from '../../utils/createTrigger'
import {CurrentUrlTrigger} from './CurrentUrlTrigger'
import {BaseTriggerRow} from './BaseTriggerRow'

const storyConfig: Meta<typeof BaseTriggerRow> = {
    title: 'Convert/AdvancedTriggers/BaseTriggerRow',
    component: BaseTriggerRow,
    argTypes: {
        onDeleteTrigger: {
            action: 'update!',
            table: {
                disabled: true,
            },
        },
        isFirst: {
            control: {
                type: 'boolean',
            },
            defaultValue: true,
        },
        isAllowedToEdit: {
            control: {
                type: 'boolean',
            },
            defaultValue: false,
        },
    },
}

type Story = StoryObj<typeof CurrentUrlTrigger>

const defaultProps: ComponentProps<typeof BaseTriggerRow> = {
    id: '1',
    trigger: createTrigger(CampaignTriggerType.CurrentUrl),
    children: null,
}

export const CurrentUrl: Story = {
    render: (args) => {
        return (
            <BaseTriggerRow {...args} {...defaultProps}>
                <CurrentUrlTrigger
                    {...defaultProps}
                    onUpdateTrigger={() => null}
                    onDeleteTrigger={args.onDeleteTrigger}
                />
            </BaseTriggerRow>
        )
    },
}

export default storyConfig
