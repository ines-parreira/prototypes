import { Button } from '@gorgias/merchant-ui-kit'

import { Drawer } from 'pages/common/components/Drawer'

import css from './StoreConfigDrawer.less'

type StoreConfigDrawerProps = {
    open: boolean
    title: string
    children: React.ReactNode
    isLoading: boolean
    onClose: () => void
    onSave: () => void
}

export const StoreConfigDrawer = (props: StoreConfigDrawerProps) => {
    return (
        <Drawer
            fullscreen={false}
            isLoading={props.isLoading}
            aria-label={props.title}
            open={props.open}
            portalRootId="app-root"
            onBackdropClick={props.onClose}
        >
            <Drawer.Header className={css.drawerHeader}>
                {props.title}
            </Drawer.Header>
            <Drawer.Content className={css.drawerContent}>
                {props.children}
            </Drawer.Content>
            <Drawer.Footer className={css.drawerFooter}>
                <Button isLoading={props.isLoading} onClick={props.onSave}>
                    Save Changes
                </Button>
                <Button
                    isLoading={props.isLoading}
                    intent="secondary"
                    onClick={props.onClose}
                >
                    Cancel
                </Button>
            </Drawer.Footer>
        </Drawer>
    )
}
