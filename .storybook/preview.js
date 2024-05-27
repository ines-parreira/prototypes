import React, {useEffect} from 'react'

import {ThemeContext, useThemeContext} from '../src/theme'
import { decorator as LDDecorator } from './launchdarkly-js-client-sdk.tsx';

require('@storybook/addon-console')

require('assets/css/main.less')
require('./style.less')

import {
    BarElement,
    BarController,
    Chart,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    LinearScale,
    CategoryScale,
    Filler,
    ArcElement,
} from 'chart.js'

export const parameters = {
    chromatic: {disableSnapshot: true},
    viewMode: 'docs',
    docs: {
        canvas: {sourceState: 'shown'},
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
    ArcElement
)

export const preview = {
    parameters,
    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Global theme for components',
            defaultValue: 'light',
            toolbar: {
                icon: 'circlehollow',
                items: [
                    {value: 'light', icon: 'circlehollow', title: 'Light'},
                    {value: 'dark', icon: 'circle', title: 'Dark'},
                ],
                showName: true,
            },
        },
    },
}

const ThemeBlock = ({background, children}) => (
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

const withTheme = (StoryFn, context) => {
    const theme = context.parameters.theme ?? context.globals.theme
    const background = theme === 'dark' ? '#333' : '#fff'
    const themeContext = useThemeContext()

    useEffect(() => {
        themeContext.setTheme(theme)
    }, [theme])

    return (
        <div className={theme} style={{height: '100%'}}>
            <ThemeContext.Provider value={themeContext}>
                <ThemeBlock background={background}>
                    <StoryFn />
                </ThemeBlock>
            </ThemeContext.Provider>
        </div>
    )
}

export const decorators = [withTheme, LDDecorator]

export default preview
