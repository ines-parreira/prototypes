import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'
import classNames from 'classnames'

import EditableTitle from 'pages/common/components/EditableTitle/EditableTitle'
import { FilterWarningIcon } from 'pages/stats/common/components/Filter/components/FilterWarning/FilterWarningIcon'

const storyConfig: Meta = {
    component: EditableTitle,
    title: 'General/EditableTitles/EditableTitle',
}

const DefaultTemplate: Story<ComponentProps<typeof EditableTitle>> = (
    props,
) => {
    return <EditableTitle {...props} />
}

const TemplateWithIcons: Story<ComponentProps<typeof EditableTitle>> = () => {
    return (
        <EditableTitle
            title="Team 1 Filter"
            update={() => {}}
            prefix={
                <i
                    className={classNames('material-icons', {
                        height: '18px',
                        width: '18px',
                    })}
                >
                    tune
                </i>
            }
            suffix={
                <FilterWarningIcon
                    tooltip="Some filters are not applicable to this report and are disabled."
                    warningType="not-applicable"
                />
            }
        />
    )
}

export const Default = DefaultTemplate.bind({})

Default.args = {
    hasError: false,
    update: () => {},
    title: 'Team 1 Filter',
    forceEditMode: false,
}

export const TitleWithIcons = TemplateWithIcons.bind({})

export default storyConfig
