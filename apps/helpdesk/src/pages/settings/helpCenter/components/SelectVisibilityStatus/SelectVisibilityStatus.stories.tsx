import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import type { CustomerVisibility } from 'models/helpCenter/types'

import type { SelectCustomerVisibilityProps } from './SelectVisibilityStatus'
import SelectCustomerVisibility from './SelectVisibilityStatus'

const storyConfig: Meta = {
    title: 'Help Center/SelectCustomerVisibility',
    component: SelectCustomerVisibility,
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

type Story = StoryObj<typeof SelectCustomerVisibility>

const Template: Story = {
    render: function Template({
        status,
        isParentUnlisted,
        showNotification,
        setShowNotification,
        type,
    }) {
        const [newStatus, setStatus] = useState(status)
        const onChange = (newStatus: CustomerVisibility) => setStatus(newStatus)
        return (
            <SelectCustomerVisibility
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

const defaultProps: Partial<SelectCustomerVisibilityProps> = {
    status: 'PUBLIC',
}

export const Public = {
    ...Template,
    args: defaultProps,
}
Public.args = defaultProps

const unlistedProps: Partial<SelectCustomerVisibilityProps> = {
    status: 'UNLISTED',
}
export const Unlisted = {
    ...Template,
    args: unlistedProps,
}

const publicUnlistedProps: Partial<SelectCustomerVisibilityProps> = {
    isParentUnlisted: true,
}
export const PublicButUnlisted = {
    ...Template,
    args: publicUnlistedProps,
}

const showNotification: Partial<SelectCustomerVisibilityProps> = {
    status: 'PUBLIC',
    isParentUnlisted: true,
    showNotification: true,
}
export const ShowNotification = {
    ...Template,
    args: showNotification,
}

export default storyConfig
