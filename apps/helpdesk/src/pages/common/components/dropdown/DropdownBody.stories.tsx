import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import DropdownBody from './DropdownBody'

const storyConfig: Meta = {
    title: 'General/Dropdown/DropdownBody',
    component: DropdownBody,
}

const DefaultTemplate: StoryObj<typeof DropdownBody> = {
    render: function DefaultTemplate(props) {
        return <DropdownBody {...props} style={{ width: '200px' }} />
    },
}

export const Default = {
    ...DefaultTemplate,
    args: {
        children: (
            <ul>
                <li>Foo</li>
                <li>Bar</li>
                <li>Baz</li>
            </ul>
        ),
        className: '',
        isLoading: false,
    },
}

export default storyConfig
