import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import CountryInput from './CountryInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/CountryInput',
    component: CountryInput,
}

type TemplateProps = ComponentProps<typeof CountryInput>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ value, ...other }) {
        const [countryCode, setCountryCode] = useState(value || 'US')

        return (
            <div style={{ width: '300px' }}>
                <CountryInput
                    {...other}
                    onChange={setCountryCode}
                    value={countryCode}
                />
            </div>
        )
    },
}

const templateParameters = {
    controls: {
        include: [
            'className',
            'value',
            'defaultCountry',
            'label',
            'popularCountries',
        ],
    },
}

const defaultProps: Partial<ComponentProps<typeof CountryInput>> = {
    className: 'mb-3',
    value: 'US',
    defaultCountry: 'US',
    label: 'Romania',
    popularCountries: ['AU', 'CA', 'GB', 'US'],
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
