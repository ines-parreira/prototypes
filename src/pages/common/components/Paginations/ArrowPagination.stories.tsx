import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import { ArrowPagination } from './ArrowPagination'

const storyConfig: Meta = {
    title: 'Navigation/Pagination/ArrowPagination',
    component: ArrowPagination,
    argTypes: {
        className: {
            description: 'The custom CSS class name of the list element.',
            control: {
                type: 'text',
            },
            defaultValue: '',
        },
        classNameItem: {
            description: 'The custom CSS class name of the item element.',
            control: {
                type: 'text',
            },
            defaultValue: '',
        },
        isPreviousDisabled: {
            description: 'Either the previous button page is disabled or not.',
            control: {
                type: 'boolean',
            },
            defaultValue: false,
        },
        isNextDisabled: {
            description: 'Either the next button page is disabled or not.',
            control: {
                type: 'boolean',
            },
            defaultValue: false,
        },
        size: {
            description: 'The size of the component.',
            control: {
                type: 'select',
                options: ['small', 'medium'],
            },
            defaultValue: 'medium',
        },
    },
}

const DefaultTemplate: Story<ComponentProps<typeof ArrowPagination>> = (
    props,
) => <ArrowPagination {...props} />

export const Default = DefaultTemplate.bind({})
Default.args = {}

export const FirstPage = DefaultTemplate.bind({})
FirstPage.args = {
    isPreviousDisabled: true,
}

export const LastPage = DefaultTemplate.bind({})
LastPage.args = {
    isNextDisabled: true,
}

export default storyConfig
