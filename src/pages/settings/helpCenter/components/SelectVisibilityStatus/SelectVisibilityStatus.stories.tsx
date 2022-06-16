import React, {useState} from 'react'
import {Meta, Story} from '@storybook/react'

import {VisibilityStatus} from 'models/helpCenter/types'
import SelectVisibilityStatus, {
    SelectVisibilityStatusProps,
} from './SelectVisibilityStatus'

const storyConfig: Meta = {
    title: 'Help Center/SelectVisibilityStatus',
    component: SelectVisibilityStatus,
    argTypes: {
        status: {
            table: {
                disable: true,
            },
        },
        onChange: {
            table: {
                disable: true,
            },
        },
        isParentUnlisted: {
            table: {
                disable: true,
            },
        },
        type: {
            table: {
                disable: true,
            },
        },
        showNotification: {
            table: {
                disable: true,
            },
        },
        setShowNotification: {
            table: {
                disable: true,
            },
        },
        className: {
            table: {
                disable: true,
            },
        },
    },
}

const Template: Story<SelectVisibilityStatusProps> = ({
    status,
    isParentUnlisted,
    showNotification,
    setShowNotification,
    type,
}) => {
    const [newStatus, setStatus] = useState(status)
    const onChange = (newStatus: VisibilityStatus) => setStatus(newStatus)
    return (
        <SelectVisibilityStatus
            status={newStatus}
            onChange={onChange}
            type={type}
            showNotification={showNotification}
            setShowNotification={setShowNotification}
            isParentUnlisted={isParentUnlisted}
        />
    )
}

const defaultProps: Partial<SelectVisibilityStatusProps> = {
    status: 'PUBLIC',
}

export const Public = Template.bind({})
Public.args = defaultProps

const unlistedProps: Partial<SelectVisibilityStatusProps> = {
    status: 'UNLISTED',
}
export const Unlisted = Template.bind({})
Unlisted.args = unlistedProps

const publicUnlistedProps: Partial<SelectVisibilityStatusProps> = {
    isParentUnlisted: true,
}
export const PublicButUnlisted = Template.bind({})
PublicButUnlisted.args = publicUnlistedProps

const showNotification: Partial<SelectVisibilityStatusProps> = {
    status: 'PUBLIC',
    isParentUnlisted: true,
    showNotification: true,
}
export const ShowNotification = Template.bind({})
ShowNotification.args = showNotification

export default storyConfig
