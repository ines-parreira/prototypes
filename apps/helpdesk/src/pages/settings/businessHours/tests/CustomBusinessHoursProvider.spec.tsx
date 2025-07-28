import { act, render, renderHook, waitFor } from '@testing-library/react'

import { IntegrationWithBusinessHoursAndStore } from '@gorgias/helpdesk-types'

import { useCustomBusinessHoursContext } from '../CustomBusinessHoursContext'
import CustomBusinessHoursProvider from '../CustomBusinessHoursProvider'

describe('CustomBusinessHoursProvider', () => {
    it('should render the children', () => {
        const { getByText } = render(
            <CustomBusinessHoursProvider>
                <div>Test</div>
            </CustomBusinessHoursProvider>,
        )

        expect(getByText('Test')).toBeInTheDocument()
    })

    describe('toggleIntegrationsToOverride', () => {
        it.each([undefined, 10])(
            'toggleIntegrationsToOverride should add or remove the integration from the integrationsToOverride array depending on selected value when businessHoursId is different',
            async (businessHoursId) => {
                const { result } = renderHook(
                    () => useCustomBusinessHoursContext(),
                    {
                        wrapper: ({ children }) => (
                            <CustomBusinessHoursProvider
                                businessHoursId={businessHoursId}
                            >
                                {children}
                            </CustomBusinessHoursProvider>
                        ),
                    },
                )

                await act(async () => {
                    result.current.toggleIntegrationsToOverride(
                        [
                            {
                                integration_id: 1,
                                business_hours: { id: 1 },
                            },
                            {
                                integration_id: 2,
                                business_hours: { id: 2 },
                            } as IntegrationWithBusinessHoursAndStore,
                        ] as IntegrationWithBusinessHoursAndStore[],
                        true,
                    )
                })

                await waitFor(() => {
                    expect(result.current.integrationsToOverride).toEqual([
                        1, 2,
                    ])
                })

                await act(async () => {
                    result.current.toggleIntegrationsToOverride(
                        [
                            { integration_id: 1, business_hours: { id: 1 } },
                        ] as IntegrationWithBusinessHoursAndStore[],
                        false,
                    )
                })

                await waitFor(() => {
                    expect(result.current.integrationsToOverride).toEqual([2])
                })
            },
        )

        it.each([undefined, 10])(
            'toggleIntegrationsToOverride should not add the integration id to the integrationsToOverride array when selected is true and businessHoursId is the same',
            async (businessHoursId) => {
                const { result } = renderHook(
                    () => useCustomBusinessHoursContext(),
                    {
                        wrapper: ({ children }) => (
                            <CustomBusinessHoursProvider
                                businessHoursId={businessHoursId}
                            >
                                {children}
                            </CustomBusinessHoursProvider>
                        ),
                    },
                )

                await act(async () => {
                    result.current.toggleIntegrationsToOverride(
                        [
                            {
                                integration_id: 1,
                                business_hours: { id: businessHoursId },
                            } as IntegrationWithBusinessHoursAndStore,
                        ],
                        true,
                    )
                })

                await waitFor(() => {
                    expect(result.current.integrationsToOverride).toEqual([])
                })
            },
        )
    })
})
