import { MenuSection, SubMenu } from '@gorgias/axiom'
import type { View } from '@gorgias/helpdesk-types'

import type {
    ViewSearchResult,
    ViewSectionGroup,
} from './useViewSearchMenuData'
import { ViewSearchMenuItem } from './ViewSearchMenuItem'

const SUBMENU_POPOVER_WIDTH = 208

type ViewSearchMenuContentProps = {
    viewId: number
    searchValue: string
    defaultViews: View[]
    sharedRootViews: View[]
    privateRootViews: View[]
    sharedSectionViews: ViewSectionGroup[]
    privateSectionViews: ViewSectionGroup[]
    searchResults: ViewSearchResult[]
    onAction: (view: View) => void
}

export function ViewSearchMenuContent({
    viewId,
    searchValue,
    defaultViews,
    sharedRootViews,
    privateRootViews,
    sharedSectionViews,
    privateSectionViews,
    searchResults,
    onAction,
}: ViewSearchMenuContentProps) {
    if (searchValue) {
        return searchResults.map(({ view, breadcrumb }) => (
            <ViewSearchMenuItem
                key={view.id}
                view={view}
                caption={breadcrumb}
                onAction={onAction}
            />
        ))
    }

    return (
        <>
            <MenuSection id="default-views" name="Default views">
                {defaultViews.map((view) => (
                    <ViewSearchMenuItem
                        key={view.id}
                        view={view}
                        onAction={onAction}
                    />
                ))}
            </MenuSection>
            <MenuSection id="shared-views-root">
                <SubMenu
                    label="Shared views"
                    minWidth={SUBMENU_POPOVER_WIDTH}
                    maxWidth={SUBMENU_POPOVER_WIDTH}
                    maxHeight={240}
                    selectionMode="single"
                    selectedKeys={[String(viewId)]}
                >
                    <MenuSection id="shared-views" name="Shared views">
                        {sharedRootViews.map((view) => (
                            <ViewSearchMenuItem
                                key={view.id}
                                view={view}
                                onAction={onAction}
                            />
                        ))}
                        {sharedSectionViews.map(({ section, views }) => (
                            <SubMenu
                                key={section.id}
                                label={section.name}
                                minWidth={SUBMENU_POPOVER_WIDTH}
                                maxWidth={SUBMENU_POPOVER_WIDTH}
                                maxHeight={240}
                                selectionMode="single"
                                selectedKeys={[String(viewId)]}
                            >
                                {views.map((view) => (
                                    <ViewSearchMenuItem
                                        key={view.id}
                                        view={view}
                                        onAction={onAction}
                                    />
                                ))}
                            </SubMenu>
                        ))}
                    </MenuSection>
                </SubMenu>
            </MenuSection>
            <MenuSection id="private-views-root">
                <SubMenu
                    label="Private views"
                    minWidth={SUBMENU_POPOVER_WIDTH}
                    maxWidth={SUBMENU_POPOVER_WIDTH}
                    maxHeight={240}
                    selectionMode="single"
                    selectedKeys={[String(viewId)]}
                >
                    <MenuSection id="private-views" name="Private views">
                        {privateRootViews.map((view) => (
                            <ViewSearchMenuItem
                                key={view.id}
                                view={view}
                                onAction={onAction}
                            />
                        ))}
                        {privateSectionViews.map(({ section, views }) => (
                            <SubMenu
                                key={section.id}
                                label={section.name}
                                minWidth={SUBMENU_POPOVER_WIDTH}
                                maxWidth={SUBMENU_POPOVER_WIDTH}
                                maxHeight={240}
                                selectionMode="single"
                                selectedKeys={[String(viewId)]}
                            >
                                {views.map((view) => (
                                    <ViewSearchMenuItem
                                        key={view.id}
                                        view={view}
                                        onAction={onAction}
                                    />
                                ))}
                            </SubMenu>
                        ))}
                    </MenuSection>
                </SubMenu>
            </MenuSection>
        </>
    )
}
