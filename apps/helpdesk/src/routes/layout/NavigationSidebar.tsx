import { SidebarContent, SidebarFooter, SidebarRoot } from '@repo/navigation'

import { Box } from '@gorgias/axiom'

export function NavigationSidebar() {
    return (
        <SidebarRoot>
            <Box></Box>

            <SidebarContent>Sidebar</SidebarContent>

            <SidebarFooter>
                {/* Empty sidebar footer */}
                <></>
            </SidebarFooter>
        </SidebarRoot>
    )
}
