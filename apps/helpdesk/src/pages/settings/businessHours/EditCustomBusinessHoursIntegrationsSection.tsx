import { useState } from 'react'

import pluralize from 'pluralize'
import { useFormContext } from 'react-hook-form'

import { Banner, LegacyButton as Button } from '@gorgias/axiom'

import AssignIntegrationsModal from './AssignIntegrationsModal'
import { EditCustomBusinessHoursFormValues } from './types'
import { getIntegrationsChangeSummary } from './utils'

import css from './EditCustomBusinessHoursIntegrationsSection.less'

export default function EditCustomBusinessHoursIntegrationsSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { watch, setValue } =
        useFormContext<EditCustomBusinessHoursFormValues>()

    const currentlyAssignedIntegrations = watch(
        'assigned_integrations.assign_integrations',
    )
    const previouslyAssignedIntegrations = watch(
        'previous_assigned_integrations',
    )

    const { newIntegrations, removedIntegrations } =
        getIntegrationsChangeSummary(
            previouslyAssignedIntegrations,
            currentlyAssignedIntegrations,
        )

    const summaryText = [
        getChangeSummaryText(newIntegrations, 'added'),
        getChangeSummaryText(removedIntegrations, 'removed'),
    ]
        .filter(Boolean)
        .join(', ')

    return (
        <div className={css.container}>
            <div className={css.currentState}>
                <div>
                    {currentlyAssignedIntegrations?.length
                        ? `${currentlyAssignedIntegrations?.length} ${pluralize(
                              'integration',
                              currentlyAssignedIntegrations?.length,
                          )} assigned`
                        : 'No integrations assigned'}
                </div>
                <Button
                    intent="secondary"
                    fillStyle="ghost"
                    onClick={() => {
                        setValue(
                            'temporary_assigned_integrations',
                            currentlyAssignedIntegrations,
                        )
                        setIsModalOpen(true)
                    }}
                >
                    Select integrations
                </Button>
            </div>

            {summaryText && (
                <Banner type="success" isClosable fillStyle="fill">
                    {summaryText}. Click <strong>Save Changes</strong> below to
                    assign them to EU-Hours.
                </Banner>
            )}
            <AssignIntegrationsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}

const getChangeSummaryText = (
    integrationIds: number[],
    actionVerb: 'added' | 'removed',
) => {
    if (integrationIds.length === 0) {
        return ''
    }

    return `${integrationIds.length} ${pluralize('integration', integrationIds.length)} ${actionVerb}`
}
