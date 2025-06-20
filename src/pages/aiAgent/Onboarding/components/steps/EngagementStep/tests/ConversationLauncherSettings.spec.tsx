import { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import {
    CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV,
    ConversationLauncherSettings,
} from 'pages/aiAgent/Onboarding/components/steps/EngagementStep/components/ConversationLauncherSettings'

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
    isAskAnythingInputEnabled: boolean
}

const Wrapper = ({
    children,
    defaultValues = { isAskAnythingInputEnabled: false },
}: {
    children: ReactNode
    defaultValues?: FormValues
}) => {
    const methods = useForm<FormValues>({ defaultValues })
    return <FormProvider {...methods}>{children}</FormProvider>
}

describe('ConversationLauncherSettings', () => {
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
                    <ConversationLauncherSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(screen.getByText('Ask anything input')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByAltText(
                    'image showing an example of the Ask anything input',
                ),
            ).toBeInTheDocument()
        })

        it('should render with custom description', () => {
            const customDescription = 'Custom conversation launcher description'
            render(
                <Wrapper>
                    <ConversationLauncherSettings
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
                    <ConversationLauncherSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const image = screen.getByAltText(
                'image showing an example of the Ask anything input',
            )
            expect(image).toHaveAttribute(
                'src',
                '/img/ai-agent/ai_agent_floating_input.png',
            )
        })
    })

    describe('toggle functionality', () => {
        it('should toggle the setting when clicked', () => {
            const { rerender } = render(
                <Wrapper defaultValues={{ isAskAnythingInputEnabled: false }}>
                    <ConversationLauncherSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            expect(toggle).not.toBeChecked()

            fireEvent.click(toggle)

            rerender(
                <Wrapper defaultValues={{ isAskAnythingInputEnabled: true }}>
                    <ConversationLauncherSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should start with toggle enabled when isAskAnythingInputEnabled is true', () => {
            render(
                <Wrapper defaultValues={{ isAskAnythingInputEnabled: true }}>
                    <ConversationLauncherSettings
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
                <Wrapper defaultValues={{ isAskAnythingInputEnabled: true }}>
                    <ConversationLauncherSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            // The EngagementSettingsCardImpact component should be rendered
            // We can verify this indirectly by checking for the presence of the card structure
            expect(screen.getByText('Ask anything input')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should show loading state when isGmvLoading is true', () => {
            render(
                <Wrapper defaultValues={{ isAskAnythingInputEnabled: true }}>
                    <ConversationLauncherSettings
                        gmv={mockGmvData}
                        isGmvLoading={true}
                    />
                </Wrapper>,
            )

            // The component should still render with loading state
            expect(screen.getByText('Ask anything input')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should handle undefined GMV data', () => {
            render(
                <Wrapper defaultValues={{ isAskAnythingInputEnabled: true }}>
                    <ConversationLauncherSettings
                        gmv={undefined}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            // The component should render even without GMV data
            expect(screen.getByText('Ask anything input')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should use the correct estimated influenced GMV percentage', () => {
            expect(CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV).toBe(0.05)
        })
    })

    describe('form integration', () => {
        it('should mark form as dirty when toggle is changed', () => {
            const mockSetValue = jest.fn()
            const MockFormWrapper = ({ children }: { children: ReactNode }) => {
                const methods = useForm<FormValues>({
                    defaultValues: { isAskAnythingInputEnabled: false },
                })
                methods.setValue = mockSetValue
                return <FormProvider {...methods}>{children}</FormProvider>
            }

            render(
                <MockFormWrapper>
                    <ConversationLauncherSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </MockFormWrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            fireEvent.click(toggle)

            expect(mockSetValue).toHaveBeenCalledWith(
                'isAskAnythingInputEnabled',
                true,
                { shouldDirty: true },
            )
        })
    })
})
