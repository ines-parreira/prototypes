import { useCallback, useState } from 'react'

import { useHistory } from 'react-router-dom'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { useDashboardNameValidation } from 'domains/reporting/hooks/dashboards/useDashboardNameValidation'
import {
    StatsPageContent,
    StatsPageHeader,
    StatsPageWrapper,
} from 'domains/reporting/pages/common/layout/StatsPage'
import { CreateDashboard } from 'domains/reporting/pages/dashboards/CreateDashboard/CreateDashboard'
import {
    DashboardName,
    DashboardNameValue,
} from 'domains/reporting/pages/dashboards/DashboardName'
import { DashboardsModal } from 'domains/reporting/pages/dashboards/DashboardsModal/DashboardsModal'
import { getDashboardPath } from 'domains/reporting/pages/dashboards/utils'
import { useNotify } from 'hooks/useNotify'
import Button from 'pages/common/components/button/Button'

export const DASHBOARD_CTA = 'Add Charts'

export const createDashboardName = (): string => {
    const [date, time] = new Date().toISOString().split('T')
    const [h, m] = time.split(':')

    const formattedDate = [date, h, m].join('-')

    return `Untitled-${formattedDate}`
}

export const Dashboards = () => {
    const history = useHistory()
    const notify = useNotify()

    const [isOpen, setIsOpen] = useState(false)
    const closeModal = useCallback(() => setIsOpen(false), [])
    const openModal = useCallback(() => setIsOpen(true), [])

    const [details, setDetails] = useState<DashboardNameValue>({
        name: createDashboardName(),
        emoji: '',
    })

    const { error } = useDashboardNameValidation(details.name)

    const { createDashboardHandler, isCreateMutationLoading } =
        useDashboardActions()

    const handleCreateDashboard = useCallback(
        (chartIds: string[]) => {
            return createDashboardHandler({
                dashboard: {
                    ...details,
                    name: details.name.trim(),
                },
                chartIds,
                onSuccess: (response) => {
                    history.push(getDashboardPath(response?.id))
                    closeModal()
                },
            })
        },
        [closeModal, createDashboardHandler, details, history],
    )

    return (
        <StatsPageWrapper>
            <StatsPageHeader
                left={
                    <DashboardName
                        value={details}
                        onChange={setDetails}
                        onBlur={() => {
                            if (error) void notify.error(error)
                        }}
                        error={error}
                        autoFocus
                    />
                }
                right={
                    <Button
                        onClick={openModal}
                        isDisabled={isCreateMutationLoading}
                    >
                        {DASHBOARD_CTA}
                    </Button>
                }
            />
            <StatsPageContent>
                <CreateDashboard />
            </StatsPageContent>
            <DashboardsModal
                isOpen={isOpen}
                onSave={handleCreateDashboard}
                onCancel={closeModal}
                isLoading={isCreateMutationLoading}
            />
        </StatsPageWrapper>
    )
}
