import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import {
    CONV_STARTERS_ESTIMATED_INFLUENCED_GMV,
    ConversationStartersSettings,
} from 'pages/aiAgent/Onboarding_V2/components/steps/EngagementStep/components/ConversationStartersSettings'

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
                screen.getByText('Suggested product questions'),
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
    })

    describe('toggle functionality', () => {
        it('should toggle the setting when clicked and enabled', async () => {
            const user = userEvent.setup()
            render(
                <Wrapper>
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

            await user.click(toggle)

            expect(toggle).toBeChecked()
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
        it('should display component when GMV data is available and toggle is checked', () => {
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

            expect(
                screen.getByText('Suggested product questions'),
            ).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should render with loading state when isGmvLoading is true', () => {
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

            expect(
                screen.getByText('Suggested product questions'),
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

            expect(
                screen.getByText('Suggested product questions'),
            ).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should use the correct estimated influenced GMV percentage', () => {
            expect(CONV_STARTERS_ESTIMATED_INFLUENCED_GMV).toBe(0.17)
        })
    })
})
