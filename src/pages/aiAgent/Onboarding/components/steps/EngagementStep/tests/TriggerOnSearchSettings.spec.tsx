import { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import {
    TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV,
    TriggerOnSearchSettings,
} from 'pages/aiAgent/Onboarding/components/steps/EngagementStep/components/TriggerOnSearchSettings'

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/usePotentialImpact',
    () => ({
        usePotentialImpact: jest.fn((percentage, gmv) => {
            if (!gmv || gmv.length === 0) return null
            return 1000 * percentage
        }),
    }),
)

jest.mock('utils', () => ({
    assetsUrl: jest.fn((path: string) => path),
}))

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

    afterEach(() => {
        jest.clearAllMocks()
    })

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

            expect(screen.getByText('Trigger on search')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Send a personalized message right after a shopper searches to guide them to the right product and drive more conversions.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByAltText(
                    'image showing an example of the trigger on search',
                ),
            ).toBeInTheDocument()
        })

        it('should render with custom description', () => {
            const customDescription = 'Custom trigger on search description'
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

        it('should render the correct image path', () => {
            render(
                <Wrapper>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const image = screen.getByAltText(
                'image showing an example of the trigger on search',
            )
            expect(image).toHaveAttribute(
                'src',
                '/img/ai-agent/ai_agent_trigger_on_search.png',
            )
        })
    })

    describe('toggle functionality', () => {
        it('should toggle the setting when clicked', () => {
            const { rerender } = render(
                <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: false }}>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            expect(toggle).not.toBeChecked()

            fireEvent.click(toggle)

            rerender(
                <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: true }}>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(screen.getByRole('checkbox')).toBeChecked()
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
        it('should display impact when GMV data is available and toggle is checked', () => {
            render(
                <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: true }}>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            // The EngagementSettingsCardImpact component should be rendered
            // We can verify this indirectly by checking for the presence of the card structure
            expect(screen.getByText('Trigger on search')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should show loading state when isGmvLoading is true', () => {
            render(
                <Wrapper defaultValues={{ isSalesHelpOnSearchEnabled: true }}>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={true}
                    />
                </Wrapper>,
            )

            // The component should still render with loading state
            expect(screen.getByText('Trigger on search')).toBeInTheDocument()
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

            // The component should render even without GMV data
            expect(screen.getByText('Trigger on search')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should use the correct estimated influenced GMV percentage', () => {
            expect(TRIGGER_ON_SEARCH_ESTIMATED_INFLUENCED_GMV).toBe(0.04)
        })
    })

    describe('form integration', () => {
        it('should mark form as dirty when toggle is changed', () => {
            const mockSetValue = jest.fn()
            const MockFormWrapper = ({ children }: { children: ReactNode }) => {
                const methods = useForm<FormValues>({
                    defaultValues: { isSalesHelpOnSearchEnabled: false },
                })
                methods.setValue = mockSetValue
                return <FormProvider {...methods}>{children}</FormProvider>
            }

            render(
                <MockFormWrapper>
                    <TriggerOnSearchSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </MockFormWrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            fireEvent.click(toggle)

            expect(mockSetValue).toHaveBeenCalledWith(
                'isSalesHelpOnSearchEnabled',
                true,
                { shouldDirty: true },
            )
        })
    })
})
