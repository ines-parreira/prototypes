import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import * as ToggleButton from './ToggleButton'

const storyConfig: Meta = {
    title: 'Data entry/ToggleButton',
    component: ToggleButton.Wrapper,
}

type TemplateProps = ComponentProps<typeof ToggleButton.Wrapper>

const TemplateWithLabel: StoryObj<TemplateProps> = {
    render: function TemplateWithLabel({ ...props }) {
        const [selectedValue, setSelectedValue] = useState<number>(1)

        return (
            <>
                <ToggleButton.Wrapper
                    value={selectedValue}
                    type={ToggleButton.Type.Label}
                    onChange={setSelectedValue}
                    {...props}
                >
                    <ToggleButton.Option value={1}>
                        Option 1
                    </ToggleButton.Option>
                    <ToggleButton.Option value={2}>
                        Option 2
                    </ToggleButton.Option>
                    <ToggleButton.Option value={3}>
                        Option 3
                    </ToggleButton.Option>
                </ToggleButton.Wrapper>
                <br />
                <br />
                <ToggleButton.Wrapper
                    value={selectedValue}
                    type={ToggleButton.Type.Label}
                    onChange={setSelectedValue}
                    size={'small'}
                    {...props}
                >
                    <ToggleButton.Option value={1}>
                        Option 1
                    </ToggleButton.Option>
                    <ToggleButton.Option value={2}>
                        Option 2
                    </ToggleButton.Option>
                    <ToggleButton.Option value={3}>
                        Option 3
                    </ToggleButton.Option>
                </ToggleButton.Wrapper>
            </>
        )
    },
}

const TemplateWithIcon: StoryObj<TemplateProps> = {
    render: function TemplateWithIcon({ ...props }) {
        const [selectedValue, setSelectedValue] = useState<number>(1)

        return (
            <>
                <ToggleButton.Wrapper
                    value={selectedValue}
                    type={ToggleButton.Type.Icon}
                    onChange={setSelectedValue}
                    {...props}
                >
                    <ToggleButton.Option value={1}>
                        <i className="material-icons">format_align_left</i>
                    </ToggleButton.Option>
                    <ToggleButton.Option value={2}>
                        <i className="material-icons">format_align_center</i>
                    </ToggleButton.Option>
                    <ToggleButton.Option value={3}>
                        <i className="material-icons">format_align_right</i>
                    </ToggleButton.Option>
                </ToggleButton.Wrapper>
                <br />
                <br />
                <ToggleButton.Wrapper
                    value={selectedValue}
                    type={ToggleButton.Type.Icon}
                    onChange={setSelectedValue}
                    size={'small'}
                    {...props}
                >
                    <ToggleButton.Option value={1}>
                        <i className="material-icons">format_align_left</i>
                    </ToggleButton.Option>
                    <ToggleButton.Option value={2}>
                        <i className="material-icons">format_align_center</i>
                    </ToggleButton.Option>
                    <ToggleButton.Option value={3}>
                        <i className="material-icons">format_align_right</i>
                    </ToggleButton.Option>
                </ToggleButton.Wrapper>
            </>
        )
    },
}

const templateParameters = {
    controls: {
        include: [],
    },
}

export const WithLabel = {
    ...TemplateWithLabel,
    parameters: templateParameters,
}

export const WithIcon = {
    ...TemplateWithIcon,
    parameters: templateParameters,
}

export default storyConfig
