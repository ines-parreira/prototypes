import cn from 'classnames'
import _kebabCase from 'lodash/kebabCase'
import React, {useCallback, useMemo} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import {logEvent, SegmentEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {closePanels} from 'state/layout/actions'

import {
    MenuItem,
    MenuItemName,
    useMainNavigationItems,
} from '../hooks/useMainNavigationItems'
import css from './MainNavigation.less'
import NavbarLink from './NavbarLink'

export {MenuItemName as ActiveContent}

type Props = {
    activeContent: MenuItemName
}

export default function MainNavigation({activeContent}: Props) {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)

    const mainMenu = useMainNavigationItems(currentUser)

    const handleClick = useCallback(
        (item: MenuItem) => {
            logEvent(SegmentEvent.MenuMainLinkClicked, item.segmentProp)
            dispatch(closePanels())
        },
        [dispatch]
    )

    const title = useMemo(
        () => mainMenu.find((item) => item.name === activeContent)?.label,
        [activeContent, mainMenu]
    )

    const canduId = `navbar-section-${_kebabCase(activeContent)}`

    return (
        <UncontrolledDropdown className={css.dropdown}>
            <DropdownToggle
                color="transparent"
                className={css.toggle}
                data-candu-id={canduId}
            >
                <div>
                    {title}
                    <i className={cn('material-icons', css.iconMore)}>
                        arrow_drop_down
                    </i>
                </div>
            </DropdownToggle>
            <DropdownMenu className={css.dropdownMenu}>
                {mainMenu.map((item) => (
                    <DropdownItem
                        key={item.label}
                        tag={NavbarLink}
                        to={item.url}
                        onClick={() => {
                            handleClick(item)
                        }}
                        className={css.dropdownItem}
                    >
                        <i className={cn('material-icons mr-2', css.icon)}>
                            {item.icon}
                        </i>
                        {item.label}
                        {item.addon}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}
