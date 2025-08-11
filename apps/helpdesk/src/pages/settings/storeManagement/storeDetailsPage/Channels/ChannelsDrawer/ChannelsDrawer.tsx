import React, { Dispatch, SetStateAction } from 'react'

import { Button } from '@gorgias/axiom'

import hideViewIcon from 'assets/img/icons/hide-view-right.svg'
import { Drawer } from 'pages/common/components/Drawer'

import { ChannelChange, ChannelWithMetadata } from '../../../types'
import DrawerContent from './DrawerContent'

import css from './ChannelsDrawer.less'

interface ChannelsDrawerProps {
    isLoading: boolean
    activeChannel: ChannelWithMetadata
    changes: ChannelChange[]
    onCloseDrawer: () => void
    onSaveDrawer: () => void
    setChanges: Dispatch<SetStateAction<ChannelChange[]>>
}

export default function ChannelsDrawer({
    isLoading,
    activeChannel,
    changes,
    onCloseDrawer,
    onSaveDrawer,
    setChanges,
}: ChannelsDrawerProps) {
    if (!activeChannel) {
        return null
    }

    return (
        <Drawer
            fullscreen={false}
            isLoading={false}
            aria-label={activeChannel.title}
            open={!!activeChannel}
            portalRootId="app-root"
            onBackdropClick={onCloseDrawer}
            rootClassName={css.drawer}
        >
            <Drawer.Header className={css.drawerHeader}>
                {activeChannel.title}
                <img
                    className={css.hideViewIcon}
                    src={hideViewIcon}
                    alt="hide-view-icon"
                    onClick={onCloseDrawer}
                />
            </Drawer.Header>
            <Drawer.Content className={css.drawerContent}>
                <DrawerContent
                    activeChannel={activeChannel}
                    setChanges={setChanges}
                />
            </Drawer.Content>
            <Drawer.Footer className={css.drawerFooter}>
                <Button
                    isLoading={isLoading}
                    onClick={onSaveDrawer}
                    isDisabled={changes.length === 0}
                >
                    Save Changes
                </Button>
                <Button
                    isLoading={isLoading}
                    intent="secondary"
                    onClick={onCloseDrawer}
                >
                    Cancel
                </Button>
            </Drawer.Footer>
        </Drawer>
    )
}
