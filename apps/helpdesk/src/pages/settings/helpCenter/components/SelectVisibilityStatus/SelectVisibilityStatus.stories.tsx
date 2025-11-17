import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import type { VisibilityStatus } from 'models/helpCenter/types'

import type { SelectVisibilityStatusProps } from './SelectVisibilityStatus'
import SelectVisibilityStatus from './SelectVisibilityStatus'

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

type Story = StoryObj<typeof SelectVisibilityStatus>

const Template: Story = {
    render: function Template({
        status,
        isParentUnlisted,
        showNotification,
        setShowNotification,
        type,
    }) {
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
    },
}

const defaultProps: Partial<SelectVisibilityStatusProps> = {
    status: 'PUBLIC',
}

export const Public = {
    ...Template,
    args: defaultProps,
}
Public.args = defaultProps

const unlistedProps: Partial<SelectVisibilityStatusProps> = {
    status: 'UNLISTED',
}
export const Unlisted = {
    ...Template,
    args: unlistedProps,
}

const publicUnlistedProps: Partial<SelectVisibilityStatusProps> = {
    isParentUnlisted: true,
}
export const PublicButUnlisted = {
    ...Template,
    args: publicUnlistedProps,
}

const showNotification: Partial<SelectVisibilityStatusProps> = {
    status: 'PUBLIC',
    isParentUnlisted: true,
    showNotification: true,
}
export const ShowNotification = {
    ...Template,
    args: showNotification,
}

export default storyConfig
