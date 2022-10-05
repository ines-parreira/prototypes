import React, {ComponentProps, useCallback, useMemo} from 'react'
import {
    ReturnAction,
    ReturnActionType,
} from 'models/selfServiceConfiguration/types'
import {Integration} from 'models/integration/types'
import loopReturns from 'assets/img/integrations/loop-returns.png'
import SelectField from 'pages/common/forms/SelectField/SelectField'

type Props = {
    loopReturnsIntegrations: Integration[]
    value: ReturnAction | null
    onChange: (value: ReturnAction) => void
}

export const ReturnActionSelectField = ({
    loopReturnsIntegrations,
    value,
    onChange,
}: Props) => {
    const options = useMemo<ComponentProps<typeof SelectField>['options']>(
        () => [
            {
                value: JSON.stringify({
                    type: ReturnActionType.AutomatedResponse,
                }),
                text: 'Automated response',
                label: 'Automated response',
            },
            ...loopReturnsIntegrations.map((loopReturnsIntegration) => ({
                value: JSON.stringify({
                    type: ReturnActionType.LoopReturns,
                    integration_id: loopReturnsIntegration.id,
                }),
                text: loopReturnsIntegration.name,
                label: (
                    <>
                        <img
                            src={loopReturns}
                            alt="Loop Returns"
                            width={20}
                            height={20}
                        />
                        <span className="ml-2">
                            {loopReturnsIntegration.name}
                        </span>
                    </>
                ),
            })),
        ],
        [loopReturnsIntegrations]
    )

    const handleChange: ComponentProps<typeof SelectField>['onChange'] =
        useCallback(
            (value) => {
                onChange(JSON.parse(value as string))
            },
            [onChange]
        )

    return (
        <SelectField
            fullWidth
            placeholder="Select a return method"
            value={value === null ? null : JSON.stringify(value)}
            options={options}
            onChange={handleChange}
        />
    )
}
