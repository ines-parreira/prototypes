import React, { useEffect } from 'react'

import type { Preview } from '@storybook/react'
import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js'

import { ThemeProvider, useSetTheme } from '../src/core/theme/index.ts'
import { initLaunchDarkly } from '../src/utils/launchDarkly.ts'
import { decorator as LDDecorator } from './launchdarkly-js-client-sdk.tsx'

// @ts-expect-error
initLaunchDarkly()

require('@storybook/addon-console')

require('../src/assets/css/main.less')
require('./style.less')

export const parameters = {
    chromatic: { disableSnapshot: true },
    viewMode: 'docs',
    docs: {
        canvas: { sourceState: 'shown' },
    },
    options: {
        storySort: {
            order: [
                'Docs Overview',
                'Design System',
                'General',
                'Navigation',
                'Data Entry',
                'Data Display',
                'Feedback',
                'Layout',
            ],
            method: 'alphabetical',
        },
    },
    backgrounds: {
        default: 'light',
        values: [
            {
                name: 'light',
                value: '#fff',
            },
            {
                name: 'grey',
                value: '#eee',
            },
            {
                name: 'dark',
                value: '#333',
            },
        ],
    },
}

Chart.register(
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    LinearScale,
    CategoryScale,
    Filler,
    ArcElement,
)

const ThemeBlock = ({ background, children }) => (
    <div
        style={{
            height: '100%',
            overflow: 'auto',
            padding: '1rem',
            background,
            color: 'var(--neutral-grey-6)',
        }}
    >
        {children}
    </div>
)

const ThemeConsumer = ({ children, theme }) => {
    const setTheme = useSetTheme()

    useEffect(() => {
        setTheme(theme)
    }, [theme, setTheme])

    return children
}

const withTheme = (StoryFn, context) => {
    const theme = context.parameters.theme ?? context.globals.theme
    const background = theme === 'dark' ? '#333' : '#fff'

    return (
        <div className={theme} style={{ height: '100%' }}>
            <ThemeProvider>
                <ThemeConsumer theme={theme}>
                    <ThemeBlock background={background}>
                        <StoryFn />
                    </ThemeBlock>
                </ThemeConsumer>
            </ThemeProvider>
        </div>
    )
}

export const preview: Preview = {
    parameters,
    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Global theme for components',
            defaultValue: 'light',
            toolbar: {
                icon: 'circlehollow',
                items: [
                    { value: 'light', icon: 'circlehollow', title: 'Light' },
                    { value: 'dark', icon: 'circle', title: 'Dark' },
                ],
                showName: true,
            },
        },
    },
    // @ts-expect-error LDDecorator types mismatch
    decorators: [withTheme, LDDecorator],
}

export default preview
