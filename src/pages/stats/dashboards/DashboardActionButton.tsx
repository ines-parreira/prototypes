import React, { useRef, useState } from 'react'

import Button from 'pages/common/components/button/Button'
import { DashboardsPageActions } from 'pages/stats/dashboards/DashboardsPageActions'
import { DashboardSchema } from 'pages/stats/dashboards/types'

export const DASHBOARD_ID_CTA = 'Actions'

export const DashboardActionButton = ({
    dashboard,
    setOpenModal,
}: {
    dashboard?: DashboardSchema
    setOpenModal: (isOpen: boolean) => void
}) => {
    const [actionsOpen, setActionsOpen] = useState<boolean>(false)

    const actionsToggleRef = useRef<HTMLButtonElement | null>(null)

    const toggleActions = () => {
        setActionsOpen(!actionsOpen)
    }

    return (
        <Button
            ref={actionsToggleRef}
            onClick={() => toggleActions()}
            trailingIcon="more_vert"
            intent="secondary"
            fillStyle="ghost"
        >
            {DASHBOARD_ID_CTA}

            <DashboardsPageActions
                showDropdown={actionsOpen}
                toggleRef={actionsToggleRef}
                handleToggleDropdown={toggleActions}
                setOpenModal={setOpenModal}
                dashboard={dashboard}
            />
        </Button>
    )
}
