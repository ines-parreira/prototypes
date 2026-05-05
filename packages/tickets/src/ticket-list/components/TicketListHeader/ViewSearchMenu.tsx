import { useCallback, useState } from 'react'

import { history } from '@repo/routing'

import {
    Box,
    DropdownIcon,
    Menu,
    MenuPlacement,
    SelectTrigger,
    Text,
} from '@gorgias/axiom'
import type { View } from '@gorgias/helpdesk-types'

import { useViewSearchMenuData } from './useViewSearchMenuData'
import { ViewSearchMenuContent } from './ViewSearchMenuContent'

import css from './ViewSearchMenu.module.less'

type ViewSearchMenuProps = {
    viewId: number
}

const MENU_POPOVER_WIDTH = 208

export function ViewSearchMenu({ viewId }: ViewSearchMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    const {
        activeView,
        viewName,
        defaultViews,
        sharedRootViews,
        privateRootViews,
        sharedSectionViews,
        privateSectionViews,
        searchResults,
    } = useViewSearchMenuData({ viewId, searchValue })

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setSearchValue('')
        }
    }, [])

    const handleViewSelect = useCallback((view: View) => {
        history.push(`/app/views/${view.id}`)
    }, [])

    if (!activeView) {
        return null
    }

    return (
        <Box className={css.triggerContainer} width="100%" minWidth={0}>
            <Menu
                aria-label="Select ticket view"
                placement={MenuPlacement.BottomLeft}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                selectionMode="single"
                selectedKeys={[String(viewId)]}
                minWidth={MENU_POPOVER_WIDTH}
                maxWidth={MENU_POPOVER_WIDTH}
                maxHeight={searchValue ? 350 : undefined}
                isSearchable
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                trigger={({ isOpen: isMenuOpen, isDisabled }) => (
                    <SelectTrigger isDisabled={isDisabled}>
                        <Box
                            flexDirection="row"
                            alignItems="center"
                            gap="xs"
                            width="100%"
                            minWidth={0}
                            maxWidth="100%"
                            pr="xs"
                        >
                            <Text
                                overflow="ellipsis"
                                wrap="nowrap"
                                variant="medium"
                                className={css.viewName}
                                color="content-neutral-default"
                            >
                                {viewName}
                            </Text>
                            <Box
                                className={css.chevron}
                                flexDirection="row"
                                alignItems="center"
                                flexShrink={0}
                            >
                                <DropdownIcon isOpen={isMenuOpen} />
                            </Box>
                        </Box>
                    </SelectTrigger>
                )}
            >
                <ViewSearchMenuContent
                    viewId={viewId}
                    searchValue={searchValue}
                    defaultViews={defaultViews}
                    sharedRootViews={sharedRootViews}
                    privateRootViews={privateRootViews}
                    sharedSectionViews={sharedSectionViews}
                    privateSectionViews={privateSectionViews}
                    searchResults={searchResults}
                    onAction={handleViewSelect}
                />
            </Menu>
        </Box>
    )
}
