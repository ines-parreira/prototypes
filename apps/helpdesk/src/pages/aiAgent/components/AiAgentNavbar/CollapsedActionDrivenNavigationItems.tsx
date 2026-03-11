import { useMemo } from 'react'

import { history } from '@repo/routing'
import { matchPath, useLocation } from 'react-router-dom'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    Menu,
    MenuItem,
} from '@gorgias/axiom'

import type { NavigationItem } from 'pages/aiAgent/hooks/useAiAgentNavigation'

type Props = {
    navigationItems: NavigationItem[]
}

export const CollapsedActionDrivenNavigationItems = ({
    navigationItems,
}: Props) => {
    const { pathname } = useLocation()

    const activeItemTitle = useMemo(() => {
        return navigationItems.find((item) => {
            if (item.items?.length) {
                return item.items.some((subItem) =>
                    matchPath(pathname, { path: subItem.route }),
                )
            }
            return matchPath(pathname, { path: item.route, exact: item.exact })
        })?.title
    }, [pathname, navigationItems])

    const handleSelectionChange = (id: string) => {
        const navigationItem = navigationItems.find((item) => item.title === id)

        if (!navigationItem) return

        const navigationRoute =
            navigationItem.route || navigationItem.items?.[0]?.route

        if (!navigationRoute) return

        history.push(navigationRoute)
    }

    return (
        <Box w="100%" justifyContent="center">
            <ButtonGroup
                orientation="vertical"
                withoutBorder
                onSelectionChange={handleSelectionChange}
                selectedKey={activeItemTitle}
            >
                {navigationItems.map((item) =>
                    item.items?.length ? (
                        <Menu
                            key={item.title}
                            selectedKeys={
                                activeItemTitle === item.title
                                    ? [
                                          item.items.find((sub) =>
                                              matchPath(pathname, {
                                                  path: sub.route,
                                              }),
                                          )?.route ?? '',
                                      ]
                                    : []
                            }
                            selectionMode="single"
                            trigger={
                                <ButtonGroupItem
                                    id={item.title}
                                    icon={item.icon}
                                >
                                    {item.title}
                                </ButtonGroupItem>
                            }
                        >
                            {item.items.map((subItem) => (
                                <MenuItem
                                    key={subItem.route}
                                    id={subItem.route}
                                    label={subItem.title}
                                    onAction={() => history.push(subItem.route)}
                                />
                            ))}
                        </Menu>
                    ) : (
                        <ButtonGroupItem
                            id={item.title}
                            key={item.title}
                            icon={item.icon}
                        >
                            {item.title}
                        </ButtonGroupItem>
                    ),
                )}
            </ButtonGroup>
        </Box>
    )
}
