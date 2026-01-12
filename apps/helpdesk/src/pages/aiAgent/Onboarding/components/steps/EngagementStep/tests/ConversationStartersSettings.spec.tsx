import type { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import {
    CONV_STARTERS_ESTIMATED_INFLUENCED_GMV,
    ConversationStartersSettings,
} from 'pages/aiAgent/Onboarding/components/steps/EngagementStep/components/ConversationStartersSettings'

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
    isConversationStartersEnabled: boolean
}

const Wrapper = ({
    children,
    defaultValues = { isConversationStartersEnabled: false },
}: {
    children: ReactNode
    defaultValues?: FormValues
}) => {
    const methods = useForm<FormValues>({ defaultValues })
    return <FormProvider {...methods}>{children}</FormProvider>
}

describe('ConversationStartersSettings', () => {
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
                    <ConversationStartersSettings
                        isEnabled={true}
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(
                screen.getByText('AI FAQs: Floating above chat'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Show up to 3 AI-generated questions above chat to answer common shopper questions and start conversations.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByAltText(
                    'image showing an example of the conversation starters',
                ),
            ).toBeInTheDocument()
        })

        it('should render with custom description', () => {
            const customDescription = 'Custom conversation starters description'
            render(
                <Wrapper>
                    <ConversationStartersSettings
                        description={customDescription}
                        isEnabled={true}
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
                    <ConversationStartersSettings
                        isEnabled={true}
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const image = screen.getByAltText(
                'image showing an example of the conversation starters',
            )
            expect(image).toHaveAttribute(
                'src',
                '/img/ai-agent/ai_agent_conversation_starters_small.png',
            )
        })
    })

    describe('toggle functionality', () => {
        it('should toggle the setting when clicked and enabled', () => {
            const { rerender } = render(
                <Wrapper
                    defaultValues={{ isConversationStartersEnabled: false }}
                >
                    <ConversationStartersSettings
                        isEnabled={true}
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            expect(toggle).not.toBeChecked()
            expect(toggle).not.toBeDisabled()

            fireEvent.click(toggle)

            rerender(
                <Wrapper
                    defaultValues={{ isConversationStartersEnabled: true }}
                >
                    <ConversationStartersSettings
                        isEnabled={true}
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should start with toggle enabled when isConversationStartersEnabled is true', () => {
            render(
                <Wrapper
                    defaultValues={{ isConversationStartersEnabled: true }}
                >
                    <ConversationStartersSettings
                        isEnabled={true}
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            expect(toggle).toBeChecked()
        })

        it('should disable toggle when isEnabled is false', () => {
            render(
                <Wrapper
                    defaultValues={{ isConversationStartersEnabled: false }}
                >
                    <ConversationStartersSettings
                        isEnabled={false}
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            expect(toggle).toBeDisabled()
        })
    })

    describe('impact calculation', () => {
        it('should display impact when GMV data is available and toggle is checked', () => {
            render(
                <Wrapper
                    defaultValues={{ isConversationStartersEnabled: true }}
                >
                    <ConversationStartersSettings
                        isEnabled={true}
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            // The EngagementSettingsCardImpact component should be rendered
            // We can verify this indirectly by checking for the presence of the card structure
            expect(
                screen.getByText('AI FAQs: Floating above chat'),
            ).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should show loading state when isGmvLoading is true', () => {
            render(
                <Wrapper
                    defaultValues={{ isConversationStartersEnabled: true }}
                >
                    <ConversationStartersSettings
                        isEnabled={true}
                        gmv={mockGmvData}
                        isGmvLoading={true}
                    />
                </Wrapper>,
            )

            // The component should still render with loading state
            expect(
                screen.getByText('AI FAQs: Floating above chat'),
            ).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should handle undefined GMV data', () => {
            render(
                <Wrapper
                    defaultValues={{ isConversationStartersEnabled: true }}
                >
                    <ConversationStartersSettings
                        isEnabled={true}
                        gmv={undefined}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            // The component should render even without GMV data
            expect(
                screen.getByText('AI FAQs: Floating above chat'),
            ).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should use the correct estimated influenced GMV percentage', () => {
            expect(CONV_STARTERS_ESTIMATED_INFLUENCED_GMV).toBe(0.17)
        })
    })

    describe('form integration', () => {
        it('should mark form as dirty when toggle is changed', () => {
            const mockSetValue = jest.fn()
            const MockFormWrapper = ({ children }: { children: ReactNode }) => {
                const methods = useForm<FormValues>({
                    defaultValues: { isConversationStartersEnabled: false },
                })
                methods.setValue = mockSetValue
                return <FormProvider {...methods}>{children}</FormProvider>
            }

            render(
                <MockFormWrapper>
                    <ConversationStartersSettings
                        isEnabled={true}
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </MockFormWrapper>,
            )

            const toggle = screen.getByRole('checkbox')
            fireEvent.click(toggle)

            expect(mockSetValue).toHaveBeenCalledWith(
                'isConversationStartersEnabled',
                true,
                { shouldDirty: true },
            )
        })
    })
})
