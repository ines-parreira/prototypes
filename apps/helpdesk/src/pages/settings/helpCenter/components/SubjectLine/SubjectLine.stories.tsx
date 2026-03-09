import { useState } from 'react'

import { noop as _noop } from 'lodash'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { DndProvider } from 'utils/wrappers/DndProvider'

import type { SubjectLineProps } from './SubjectLine'
import SubjectLine from './SubjectLine'

const storyConfig: Meta = {
    title: 'Help Center/SubjectLine',
    component: SubjectLine,
}

const defaultProps: SubjectLineProps = {
    onDelete: _noop,
    onChange: _noop,
    onMoveEntity: _noop,
    position: 0,
    value: '',
}

type Story = StoryObj<typeof SubjectLine>

const Template: Story = {
    render: function Template(args) {
        const [value, setValue] = useState(args.value)
        const onChange = (nextValue: string) => {
            setValue(nextValue)
        }

        return (
            <DndProvider backend={HTML5Backend}>
                <SubjectLine {...args} onChange={onChange} value={value} />
            </DndProvider>
        )
    },
}

const templateParameters = {
    controls: {
        include: ['value'],
    },
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
