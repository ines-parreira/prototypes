import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from '@storybook/react'
import { action } from 'storybook/actions'

import {
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
} from 'fixtures/bigcommerce'

import { ModifiersPopover, ModifiersPopoverBody } from './ModifiersPopover'

const storyConfig: Meta = {
    title: 'BigCommerce/AddOrderModal/ModifiersPopover',
    component: ModifiersPopoverBody,
    argTypes: {},
}

const Template: StoryObj<typeof ModifiersPopover> = {
    render: function Template(props) {
        return <ModifiersPopover {...props} />
    },
}

const defaultProps: ComponentProps<typeof ModifiersPopover> = {
    storeHash: 'Hello',
    product: bigCommerceProductFixture(),
    lineItem: bigCommerceLineItemFixture(),
    sku: 'THIS IS SKU',
    onClose: () => action('Close'),
    onApply: () => action('Apply'),
    setReference: () => action('Reference set'),
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export default storyConfig
