import type { Meta, StoryObj } from 'storybook-react-rsbuild'

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

const DefaultTemplate: StoryObj<typeof ArrowPagination> = {
    render: (props) => <ArrowPagination {...props} />,
}

export const Default = {
    ...DefaultTemplate,
    args: {},
}

export const FirstPage = {
    ...DefaultTemplate,
    args: {
        isPreviousDisabled: true,
    },
}

export const LastPage = {
    ...DefaultTemplate,
    args: {
        isNextDisabled: true,
    },
}

export default storyConfig
