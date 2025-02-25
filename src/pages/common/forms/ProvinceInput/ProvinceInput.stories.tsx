import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import ProvinceInput from './ProvinceInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/ProvinceInput',
    component: ProvinceInput,
}

const Template: Story<ComponentProps<typeof ProvinceInput>> = ({
    ...other
}: ComponentProps<typeof ProvinceInput>) => {
    return (
        <div style={{ width: '300px' }}>
            <ProvinceInput {...other} />
        </div>
    )
}

const templateParameters = {
    controls: {
        include: [
            'disabled',
            'label',
            'onChange',
            'country',
            'name',
            'hasError',
            'error',
            'isRequired',
        ],
    },
}

const defaultProps: Partial<ComponentProps<typeof ProvinceInput>> = {
    className: 'mb-3',
    country: 'United States',
    label: 'State or Province',
    name: 'stateOrProvince',
    isRequired: true,
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
