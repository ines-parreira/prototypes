import React, { useRef, useState } from 'react'

import {
    LegacyIconButton as IconButton,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { DashboardsPageActions } from 'domains/reporting/pages/dashboards/DashboardsPageActions'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'

export const DASHBOARD_ACTIONS_LABEL = 'Actions'
export const DASHBOARD_ACTIONS_MENU_ICON = 'more_vert'

export const DashboardActionButton = ({
    dashboard,
    setOpenModal,
}: {
    dashboard?: DashboardSchema
    setOpenModal: (isOpen: boolean) => void
}) => {
    const [actionsOpen, setActionsOpen] = useState<boolean>(false)

    const actionsToggleRef = useRef<HTMLButtonElement | null>(null)
    const tooltipRef = useRef<HTMLDivElement | null>(null)

    const toggleActions = () => {
        setActionsOpen(!actionsOpen)
    }

    return (
        <div ref={tooltipRef}>
            <IconButton
                as="button"
                ref={actionsToggleRef}
                intent="secondary"
                fillStyle="ghost"
                icon={DASHBOARD_ACTIONS_MENU_ICON}
                onClick={() => toggleActions()}
                aria-label={DASHBOARD_ACTIONS_LABEL}
            ></IconButton>
            <DashboardsPageActions
                showDropdown={actionsOpen}
                toggleRef={actionsToggleRef}
                handleToggleDropdown={toggleActions}
                setOpenModal={setOpenModal}
                dashboard={dashboard}
            />
            <Tooltip
                target={actionsToggleRef}
                placement={'top'}
                boundariesElement={'body'}
                innerProps={{ placement: 'top' }}
            >
                {DASHBOARD_ACTIONS_LABEL}
            </Tooltip>
        </div>
    )
}
