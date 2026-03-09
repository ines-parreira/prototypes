import type { ComponentProps } from 'react'
import React from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import { Drawer } from 'pages/common/components/Drawer/Drawer'

const storyConfig: Meta = {
    title: 'Layout/Drawer',
    component: Drawer,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof Drawer>> = () => {
    const [isOpen, setIsOpen] = React.useState(true)
    return (
        <>
            <Button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Close Drawer' : 'Open Drawer'}
            </Button>
            <Drawer
                open={isOpen}
                portalRootId={'root'}
                isLoading={false}
                fullscreen={false}
                onBackdropClick={() => setIsOpen(false)}
            >
                <Drawer.Header>
                    Some Title
                    <Drawer.HeaderActions
                        onClose={() => setIsOpen(!isOpen)}
                        closeButtonId="close-button"
                    />
                </Drawer.Header>
                <Drawer.Content>Some content</Drawer.Content>
                <Drawer.Footer>Some Footer</Drawer.Footer>
            </Drawer>
        </>
    )
}

export const Default = Template.bind({})

export default storyConfig
