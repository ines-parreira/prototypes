import React from 'react'
import {noop as _noop} from 'lodash'
import {Meta, Story} from '@storybook/react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import SubjectLine, {SubjectLineProps} from './SubjectLine'

const storyConfig: Meta = {
    title: 'Help Center/SubjectLine',
    component: SubjectLine,
}

const defaultProps: SubjectLineProps = {
    onDelete: _noop,
    onChange: _noop,
    onMoveEntity: _noop,
    onDropEntity: _noop,
    position: 0,
    value: '',
}

const Template: Story<SubjectLineProps> = (args) => {
    const [value, setValue] = React.useState(args.value)
    const onChange = (nextValue: string) => {
        setValue(nextValue)
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <SubjectLine {...args} onChange={onChange} value={value} />
        </DndProvider>
    )
}

const templateParameters = {
    controls: {
        include: ['value'],
    },
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
