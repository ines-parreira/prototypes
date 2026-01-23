import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import {
    CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV,
    ConversationLauncherSettings,
} from 'pages/aiAgent/Onboarding_V2/components/steps/EngagementStep/components/ConversationLauncherSettings'

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
    })

    describe('toggle functionality', () => {
        it('should toggle the setting when clicked', async () => {
            const user = userEvent.setup()
            render(
                <Wrapper>
                    <ConversationLauncherSettings
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
        it('should display component when GMV data is available and toggle is checked', () => {
            render(
                <Wrapper defaultValues={{ isAskAnythingInputEnabled: true }}>
                    <ConversationLauncherSettings
                        gmv={mockGmvData}
                        isGmvLoading={false}
                    />
                </Wrapper>,
            )

            expect(screen.getByText('Ask anything input')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should render with loading state when isGmvLoading is true', () => {
            render(
                <Wrapper defaultValues={{ isAskAnythingInputEnabled: true }}>
                    <ConversationLauncherSettings
                        gmv={mockGmvData}
                        isGmvLoading={true}
                    />
                </Wrapper>,
            )

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

            expect(screen.getByText('Ask anything input')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeChecked()
        })

        it('should use the correct estimated influenced GMV percentage', () => {
            expect(CONV_LAUNCHER_ESTIMATED_INFLUENCED_GMV).toBe(0.05)
        })
    })
})
