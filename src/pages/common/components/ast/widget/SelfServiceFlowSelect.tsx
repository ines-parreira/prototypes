import React, {useEffect} from 'react'
import {fromJS, List} from 'immutable'

import {fetchSelfServiceConfigurations} from '../../../../../models/selfServiceConfiguration/resources'
import {SELECTABLE_REASONS_DROPDOWN_OPTIONS} from '../../../../settings/selfService/components/ReportIssueCaseEditor/constants'
import useAppSelector from '../../../../../hooks/useAppSelector'

import {getSelfServiceConfigurations} from '../../../../../state/entities/selfServiceConfigurations/selectors'
import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {selfServiceConfigurationsFetched} from '../../../../../state/entities/selfServiceConfigurations/actions'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
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
    const selfServiceConfigurations = useAppSelector(
        getSelfServiceConfigurations
    )

    useEffect(() => {
        if (selfServiceConfigurations.length === 0) {
            void (async () => {
                try {
                    const configResponse =
                        await fetchSelfServiceConfigurations()
                    void dispatch(
                        selfServiceConfigurationsFetched(configResponse.data)
                    )
                } catch (error) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message:
                                'Could not fetch Self-service configurations, please try again later.',
                        })
                    )
                }
            })()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    let options = fromJS([]) as List<any>
    const availableFlows = new Set()

    if (flowType === 'order-management') {
        selfServiceConfigurations.forEach((config) => {
            if (config.cancel_order_policy.enabled) {
                if (!availableFlows.has('cancel')) {
                    availableFlows.add('cancel')
                    options = options.push({
                        value: 'cancel_order_flow',
                        label: 'Cancel order',
                    })
                }
            }
            if (config.return_order_policy.enabled) {
                if (!availableFlows.has('return')) {
                    availableFlows.add('return')
                    options = options.push({
                        value: 'return_order_flow',
                        label: 'Return order',
                    })
                }
            }
            if (config.report_issue_policy.enabled) {
                config.report_issue_policy.cases.forEach((issue) => {
                    issue.reasons.forEach((reason) => {
                        if (!availableFlows.has(reason)) {
                            availableFlows.add(reason)
                            const reasonSpecs =
                                SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
                                    (opt) => opt.value === reason.reasonKey
                                )
                            if (reasonSpecs) {
                                options = options.push({
                                    value: reason.reasonKey,
                                    label: `Report issue: ${
                                        reasonSpecs['label'] as string
                                    }`,
                                })
                            }
                        }
                    })
                })
            }
        })
    } else if (flowType === 'quick-response') {
        selfServiceConfigurations.forEach((config) => {
            config.quick_response_policies.forEach((flow) => {
                if (!availableFlows.has(flow.title)) {
                    availableFlows.add(flow.title)
                    options = options.push({
                        value: flow.id,
                        label: flow.title,
                    })
                }
            })
        })
    }

    options = options.sort(
        (option1: OptionWithLabel, option2: OptionWithLabel) => {
            return (
                (option1['label'].startsWith(
                    'Report issue'
                ) as unknown as number) -
                    (option2['label'].startsWith(
                        'Report issue'
                    ) as unknown as number) ||
                (option1['label'] > option2['label'] ? 1 : -1)
            )
        }
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
