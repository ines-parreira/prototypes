import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import {
    TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV,
    TriggerOnSearchSettings,
} from 'pages/aiAgent/Onboarding_V2/components/steps/EngagementStep/components/TriggerOnSearchSettings'

type FormValues = {
    isSalesHelpOnSearchEnabled: boolean
}

const Wrapper = ({
    children,
    defaultValues = { isSalesHelpOnSearchEnabled: false },
}: {
    children: ReactNode
    defaultValues?: FormValues
}) => {
    const methods = useForm<FormValues>({ defaultValues })
    return <FormProvider {...methods}>{children}</FormProvider>
}

describe('TriggerOnSearchSettings', () => {
    const mockGmvData: TimeSeriesDataItem[][] = [
        [
            { dateTime: '2024-01-01', value: 10000 },
            { dateTime: '2024-01-02', value: 15000 },
        ],
    ]

    describe('rendering', () => {
        it('should render the component with default props', () => {
            render(
                <Wrapper>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(screen.getByText('Proactive assists')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Send a personalized message right after a shopper searches to guide them to the right product and drive more conversions.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByAltText(
                    'image showing an example of the search assist',
                ),
            ).toBeInTheDocument()
        })

        it('should render with custom description', () => {
            const customDescription = 'Custom search assist description'
            render(
                <Wrapper>
                    <TriggerOnSearchSettings
                        description={customDescription}
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(screen.getByText(customDescription)).toBeInTheDocument()
        })
    })

    describe('toggle functionality', () => {
        it('should toggle the setting when clicked', async () => {
            const user = userEvent.setup()
            render(
                <Wrapper>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            expect(toggle).not.toBeChecked()

            await user.click(toggle)

            expect(toggle).toBeChecked()
        })

        it('should start with toggle enabled when isSalesHelpOnSearchEnabled is true', () => {
            render(
                <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: true }}>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            expect(toggle).toBeChecked()
        })
    })

    describe('impact calculation', () => {
        it('should display component when GMV data is available and toggle is checked', () => {
            render(
                <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: true }}>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(screen.getByText('Proactive assists')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should render with loading state when isGmvLoading is true', () => {
            render(
                <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: true }}>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={true}
                    />
                </Wrapper>,
            )

            expect(screen.getByText('Proactive assists')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should handle undefined GMV data', () => {
            render(
                <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: true }}>
                    <TriggerOnSearchSettings
                        gmv={undefined}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(screen.getByText('Proactive assists')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should use the correct estimated influenced GMV percentage', () => {
            expect(TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV).toBe(0.04)
        })
    })
})
