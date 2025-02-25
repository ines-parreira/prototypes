import React from 'react'

import { fromJS, List } from 'immutable'

import { SELECTABLE_REASONS_DROPDOWN_OPTIONS } from 'models/selfServiceConfiguration/constants'
import { useGetSelfServiceConfigurations } from 'models/selfServiceConfiguration/queries'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import { notify } from '../../../../../state/notifications/actions'
import { NotificationStatus } from '../../../../../state/notifications/types'
import Select from './ReactSelect'

type OwnProps = {
    onChange: (value: number) => void
    className?: string
    value: any
    flowType: string
}

type OptionWithLabel = {
    label: string // text displayed in the dropdown
}

export function SelfServiceFlowSelect({
    className,
    value,
    onChange,
    flowType,
}: OwnProps) {
    const dispatch = useAppDispatch()

    const { data: selfServiceConfigurations = [] } =
        useGetSelfServiceConfigurations({
            onError: () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Could not fetch Self-service configurations, please try again later.',
                    }),
                )
            },
        })

    let options = fromJS([]) as List<any>
    const availableFlows = new Set()

    if (flowType === 'order-management') {
        selfServiceConfigurations.forEach((config) => {
            if (config.cancelOrderPolicy.enabled) {
                if (!availableFlows.has('cancel')) {
                    availableFlows.add('cancel')
                    options = options.push({
                        value: 'cancel_order_flow',
                        label: 'Cancel order',
                    })
                }
            }
            if (config.returnOrderPolicy.enabled) {
                if (!availableFlows.has('return')) {
                    availableFlows.add('return')
                    options = options.push({
                        value: 'return_order_flow',
                        label: 'Return order',
                    })
                }
            }
            if (config.reportIssuePolicy.enabled) {
                config.reportIssuePolicy.cases.forEach((issue) => {
                    issue.newReasons.forEach((reason) => {
                        if (!availableFlows.has(reason.reasonKey)) {
                            availableFlows.add(reason.reasonKey)
                            const reasonSpecs =
                                SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
                                    (opt) => opt.value === reason.reasonKey,
                                )

                            if (reasonSpecs) {
                                const TOOLTIP_WORDS_THRESHOLD = 50
                                const label = `Report issue: ${
                                    reasonSpecs['label'] as string
                                }`

                                options = options.push({
                                    value: reason.reasonKey,
                                    label,
                                    tooltipText:
                                        label.length > TOOLTIP_WORDS_THRESHOLD
                                            ? label
                                            : undefined,
                                })
                            }
                        }
                    })
                })
            }
        })
    }

    options = options.sort(
        (option1: OptionWithLabel, option2: OptionWithLabel) => {
            return (
                (option1['label'].startsWith(
                    'Report issue',
                ) as unknown as number) -
                    (option2['label'].startsWith(
                        'Report issue',
                    ) as unknown as number) ||
                (option1['label'] > option2['label'] ? 1 : -1)
            )
        },
    ) as List<any>

    return (
        <Select
            className={className}
            value={value}
            onChange={onChange}
            options={options.toJS()}
            focusedPlaceholder="Search flows by name..."
            sortOptions={false}
        />
    )
}

export default SelfServiceFlowSelect
