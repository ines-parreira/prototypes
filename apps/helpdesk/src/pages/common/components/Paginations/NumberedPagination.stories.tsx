import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { NumberedPagination } from './NumberedPagination'

const storyConfig: Meta = {
    title: 'Navigation/Pagination/NumberedPagination',
    component: NumberedPagination,
    argTypes: {
        boundaryCount: {
            description:
                'Number of always visible pages at the beginning and end.',
            control: {
                type: 'number',
            },
            defaultValue: 1,
        },
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
        count: {
            description: 'The total number of pages.',
            control: {
                type: 'number',
            },
            defaultValue: 1,
        },
        defaultPage: {
            description:
                'The page selected by default when the component is uncontrolled.',
            control: {
                type: 'number',
            },
            defaultValue: 1,
        },
        page: {
            description: 'The current page.',
            control: {
                type: 'number',
            },
            defaultValue: 1,
        },
        siblingCount: {
            description:
                'Number of always visible pages before and after the current page.',
            control: {
                type: 'number',
            },
            defaultValue: 1,
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

const DefaultTemplate: StoryObj<typeof NumberedPagination> = {
    render: (props) => <NumberedPagination {...props} />,
}

export const Default = {
    ...DefaultTemplate,
    args: {
        count: 8,
    },
}

export const SmallSize = {
    ...DefaultTemplate,
    args: {
        count: 10,
        size: 'small',
    },
}

export const LargeCount = {
    ...DefaultTemplate,
    args: {
        count: 60,
        page: 12,
    },
}

export default storyConfig
