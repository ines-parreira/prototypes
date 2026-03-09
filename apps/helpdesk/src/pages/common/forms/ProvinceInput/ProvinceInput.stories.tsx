import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import ProvinceInput from './ProvinceInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/ProvinceInput',
    component: ProvinceInput,
}

type Story = StoryObj<typeof ProvinceInput>

const Template: Story = {
    render: function Template({ ...props }) {
        return (
            <div style={{ width: '300px' }}>
                <ProvinceInput {...props} />
            </div>
        )
    },
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

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
