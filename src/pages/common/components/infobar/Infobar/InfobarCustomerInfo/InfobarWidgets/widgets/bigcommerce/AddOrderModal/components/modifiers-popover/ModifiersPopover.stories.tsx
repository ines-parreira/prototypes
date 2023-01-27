import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {action} from '@storybook/addon-actions'
import {
    bigCommerceVariantFixture,
    bigCommerceProductFixture,
} from 'fixtures/bigcommerce'
import {ModifiersPopoverBody, ModifiersPopover} from './ModifiersPopover'

const storyConfig: Meta = {
    title: 'BigCommerce/AddOrderModal/ModifiersPopover',
    component: ModifiersPopoverBody,
    argTypes: {},
}

const Template: Story<ComponentProps<typeof ModifiersPopover>> = (props) => (
    <ModifiersPopover {...props} />
)

const defaultProps: ComponentProps<typeof ModifiersPopover> = {
    storeHash: 'Hello',
    product: bigCommerceProductFixture(),
    variant: bigCommerceVariantFixture(),
    onClose: () => action('Close'),
    onApply: () => action('Apply'),
}

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
