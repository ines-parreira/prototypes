import React, { ComponentProps } from 'react'

import { Meta, StoryFn } from '@storybook/react'

import { Button, IconButton } from '@gorgias/merchant-ui-kit'

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
                    <Drawer.HeaderActions>
                        <IconButton
                            onClick={() => setIsOpen(!isOpen)}
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            icon={'keyboard_tab'}
                        />
                    </Drawer.HeaderActions>
                </Drawer.Header>
                <Drawer.Content>Some content</Drawer.Content>
                <Drawer.Footer>Some Footer</Drawer.Footer>
            </Drawer>
        </>
    )
}

export const Default = Template.bind({})

export default storyConfig
