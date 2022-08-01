import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import Button from 'pages/common/components/button/Button'

import Screens from './Screens'
import Screen from './Screen'

const storyConfig: Meta = {
    title: 'General/screens/Screens',
    component: Screens,
}

const screens: {
    name: string
    parent?: string
    items: {label: string; nextScreen?: string}[]
}[] = [
    {
        name: 'main',
        items: [
            {label: 'Your profile'},
            {label: 'Gorgias updates', nextScreen: 'gorgias_updates'},
            {label: 'Learn', nextScreen: 'learn'},
            {label: 'Keyboard shortcuts'},
        ],
    },
    {
        name: 'gorgias_updates',
        parent: 'main',
        items: [
            {label: 'Latest updates'},
            {label: 'Roadmap'},
            {label: 'Service status'},
        ],
    },
    {
        name: 'learn',
        parent: 'main',
        items: [
            {label: 'Help center'},
            {label: 'Gorgias Academy'},
            {label: 'Gorgias Community'},
        ],
    },
]

const Template: Story<ComponentProps<typeof Screens>> = () => {
    const [activeScreen, setActiveScreen] = useState('main')

    return (
        <Screens activeScreen={activeScreen}>
            {screens.map((screen) => (
                <Screen
                    key={screen.name}
                    name={screen.name}
                    style={{display: 'flex', flexDirection: 'column'}}
                >
                    {!!screen.parent && (
                        <Button
                            onClick={() =>
                                setActiveScreen(screen.parent as string)
                            }
                            style={{marginBottom: 8}}
                        >
                            <i className="material-icons">chevron_left</i> Back
                        </Button>
                    )}
                    {screen.items.map((item) => (
                        <Button
                            key={item.label}
                            onClick={() =>
                                item.nextScreen &&
                                setActiveScreen(item.nextScreen)
                            }
                            style={{marginBottom: 8}}
                        >
                            {item.label}
                            {item.nextScreen && (
                                <i className="material-icons">chevron_right</i>
                            )}
                        </Button>
                    ))}
                </Screen>
            ))}
        </Screens>
    )
}

export const Default = Template.bind({})

export default storyConfig
