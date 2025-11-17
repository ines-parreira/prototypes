import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import type { GorgiasChatInstallationVisibility } from 'models/integration/types'
import {
    GorgiasChatInstallationVisibilityConditionOperator,
    GorgiasChatInstallationVisibilityMatchConditions,
    GorgiasChatInstallationVisibilityMethod,
} from 'models/integration/types'

import GorgiasChatIntegrationVisibilityControls from '../GorgiasChatIntegrationVisibilityControls'

describe('<GorgiasChatIntegrationVisibilityControls />', () => {
    const baseProps: Omit<
        ComponentProps<typeof GorgiasChatIntegrationVisibilityControls>,
        'integration'
    > = {
        open: () => ({}),
        isOpen: true,
        isUpdate: false,
        canSubmit: true,
        onSubmit: () => ({}),
        onValidate: () => ({}),
    }

    it('should not render incompatible conditions alert', () => {
        const visibility: GorgiasChatInstallationVisibility = {
            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
            match_conditions:
                GorgiasChatInstallationVisibilityMatchConditions.Every,
            conditions: [
                {
                    id: '1',
                    value: 'https://www.example.com',
                    operator:
                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                },
            ],
        }

        const integration = fromJS({
            meta: {
                installation: {
                    visibility,
                },
            },
        }) as Map<any, any>

        const { queryByText } = render(
            <GorgiasChatIntegrationVisibilityControls
                {...baseProps}
                integration={integration}
            />,
        )

        expect(
            queryByText(/conditions are incompatible/),
        ).not.toBeInTheDocument()
    })

    it.each([
        [
            'multiple is conditions',
            [
                {
                    id: '1',
                    value: 'https://www.example.com',
                    operator:
                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                },
                {
                    id: '2',
                    value: 'https://www.example.com/test',
                    operator:
                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                },
            ],
        ],
    ])(
        'should render incompatible conditions alert for %p',
        (_, conditions) => {
            const visibility: GorgiasChatInstallationVisibility = {
                method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                match_conditions:
                    GorgiasChatInstallationVisibilityMatchConditions.Every,
                conditions,
            }

            const integration = fromJS({
                meta: {
                    installation: {
                        visibility,
                    },
                },
            }) as Map<any, any>

            const { getByText } = render(
                <GorgiasChatIntegrationVisibilityControls
                    {...baseProps}
                    integration={integration}
                />,
            )

            expect(getByText(/conditions are incompatible/)).toBeInTheDocument()
        },
    )
})
