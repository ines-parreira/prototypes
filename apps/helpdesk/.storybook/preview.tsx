import { useEffect } from 'react'
import type { PropsWithChildren } from 'react'

import { initLaunchDarkly } from '@repo/feature-flags'
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
import type { Preview } from 'storybook-react-rsbuild'
import { spyOn } from 'storybook/test'

import {
    THEME_NAME,
    ThemeProvider,
    useApplyTheme,
    useSetTheme,
} from '../src/core/theme/index.ts'
import type { HelpdeskThemeName } from '../src/core/theme/index.ts'
import { decorator as launchDarklyDecorator } from './launchdarkly-js-client-sdk.tsx'

import '../src/assets/css/main.less'
import './style.less'

const STORYBOOK_USER = { id: 'storybook-user' }
const STORYBOOK_ACCOUNT = {
    id: 'storybook-account',
    domain: 'storybook.local',
}

void initLaunchDarkly(STORYBOOK_USER, STORYBOOK_ACCOUNT)

const backgroundOptions = {
    light: {
        name: 'light',
        value: '#fff',
    },
    grey: {
        name: 'grey',
        value: '#eee',
    },
    dark: {
        name: 'dark',
        value: '#333',
    },
} satisfies NonNullable<Preview['parameters']>['backgrounds']['options']

const parameters: Preview['parameters'] = {
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
        options: backgroundOptions,
    },
}

const initialGlobals: Preview['initialGlobals'] = {
    backgrounds: {
        value: 'light',
    },
}

const themeToolbarItems = [
    { value: THEME_NAME.Light, icon: 'circlehollow', title: 'Light' },
    { value: THEME_NAME.Dark, icon: 'circle', title: 'Dark' },
    { value: THEME_NAME.Classic, icon: 'contrast', title: 'Classic' },
]

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

type ThemeBlockProps = PropsWithChildren<{
    background: string
}>

function ThemeBlock({ background, children }: ThemeBlockProps) {
    return (
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
}

type StorybookThemeProps = PropsWithChildren<{
    theme: HelpdeskThemeName
}>

function StorybookTheme({ children, theme }: StorybookThemeProps) {
    const setTheme = useSetTheme()

    useEffect(() => {
        setTheme(theme)
    }, [theme, setTheme])

    useApplyTheme()

    return children
}

function getThemeBackground(theme: HelpdeskThemeName) {
    return theme === THEME_NAME.Dark ? '#333' : '#fff'
}

const withTheme: Preview['decorators'][number] = (Story, context) => {
    const theme = (context.parameters.theme ??
        context.globals.theme ??
        THEME_NAME.Light) as HelpdeskThemeName

    return (
        <div className={theme} style={{ height: '100%' }}>
            <ThemeProvider>
                <StorybookTheme theme={theme}>
                    <ThemeBlock background={getThemeBackground(theme)}>
                        <Story />
                    </ThemeBlock>
                </StorybookTheme>
            </ThemeProvider>
        </div>
    )
}

const preview: Preview = {
    parameters,
    initialGlobals,
    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Global theme for components',
            defaultValue: THEME_NAME.Light,
            toolbar: {
                icon: 'mirror',
                items: themeToolbarItems,
                showName: true,
            },
        },
    },
    decorators: [withTheme, launchDarklyDecorator],
    tags: ['autodocs'],
}

export default preview

const consoleMethods = [
    'log',
    'warn',
    'error',
    'info',
    'debug',
    'trace',
    'count',
    'dir',
    'assert',
] as const

export const beforeEach = function beforeEach() {
    for (const method of consoleMethods) {
        spyOn(console, method).mockName(`console.${method}`)
    }
}
