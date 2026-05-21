import type { ReactNode } from 'react'

import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { AudienceCard } from './AudienceCard'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: ReactNode
        children: ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ title }: { title?: ReactNode }) => (
        <div role="tooltip">{title}</div>
    ),
}))

jest.mock('AIJourney/formFields', () => ({
    AudienceSelect: ({ type }: { type: string }) => {
        const { watch } = useFormContext()
        const fieldName =
            type === 'include'
                ? 'included_audience_list_ids'
                : 'excluded_audience_list_ids'
        const value = watch(fieldName)
        return (
            <div>
                AudienceSelect:{type}:{JSON.stringify(value ?? null)}
            </div>
        )
    },
}))

jest.mock(
    'AIJourney/components/KlaviyoPermissionBanner/KlaviyoPermissionBanner',
    () => ({
        KlaviyoPermissionBanner: () => <div>KlaviyoPermissionBanner</div>,
    }),
)

const mockUseJourneyContext = jest.fn()
jest.mock('AIJourney/providers', () => ({
    useJourneyContext: () => mockUseJourneyContext(),
}))

type RenderOptions = {
    isV3Architecture?: boolean
    isAudienceRequired?: boolean
    journeyType?: string
    defaultIncluded?: string[]
    defaultExcluded?: string[]
    defaultNarrowAudienceEnabled?: boolean
}

const FormWrapper = ({
    children,
    defaults,
}: {
    children: ReactNode
    defaults: {
        included_audience_list_ids?: string[]
        excluded_audience_list_ids?: string[]
        narrow_audience_enabled?: boolean
    }
}) => {
    const methods = useForm({ defaultValues: defaults })
    return <FormProvider {...methods}>{children}</FormProvider>
}

const renderComponent = (
    isFormReady: boolean,
    {
        isV3Architecture = false,
        isAudienceRequired = false,
        journeyType = 'welcome',
        defaultIncluded,
        defaultExcluded,
        defaultNarrowAudienceEnabled,
    }: RenderOptions = {},
) => {
    mockUseJourneyContext.mockReturnValue({
        currentIntegration: { id: 1, name: 'Test Store' },
        shopName: 'test-store',
        journeyType,
    })

    return render(
        <FormWrapper
            defaults={{
                included_audience_list_ids: defaultIncluded,
                excluded_audience_list_ids: defaultExcluded,
                narrow_audience_enabled: defaultNarrowAudienceEnabled,
            }}
        >
            <AudienceCard
                isFormReady={isFormReady}
                isV3Architecture={isV3Architecture}
                isAudienceRequired={isAudienceRequired}
            />
        </FormWrapper>,
    )
}

describe('<AudienceCard />', () => {
    afterEach(() => {
        mockUseJourneyContext.mockReset()
    })

    describe('when isFormReady is false', () => {
        it('renders a skeleton instead of the card', () => {
            renderComponent(false)

            expect(screen.queryByText('Audience')).not.toBeInTheDocument()
            expect(
                screen.queryByText('KlaviyoPermissionBanner'),
            ).not.toBeInTheDocument()
        })

        it('renders a skeleton without the fixed 680px width when isV3Architecture is true', () => {
            renderComponent(false, { isV3Architecture: true })

            expect(
                screen.queryByText('KlaviyoPermissionBanner'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(/AudienceSelect:include/),
            ).not.toBeInTheDocument()
        })
    })

    describe('when isFormReady is true (legacy)', () => {
        it('renders the legacy Audience card header', () => {
            renderComponent(true)

            expect(screen.getByText('Audience')).toBeInTheDocument()
        })

        it('renders include and exclude audience selects and the permission banner', () => {
            renderComponent(true)

            expect(
                screen.getByText('KlaviyoPermissionBanner'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/AudienceSelect:include/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/AudienceSelect:exclude/),
            ).toBeInTheDocument()
        })
    })

    describe('when isV3Architecture is true and journey is a flow', () => {
        it('renders the toggle without audience selects when toggle is off', () => {
            renderComponent(true, { isV3Architecture: true })

            expect(screen.queryByText('Audience')).not.toBeInTheDocument()
            expect(
                screen.getByRole('switch', { name: 'Narrow down audience' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('KlaviyoPermissionBanner'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(/AudienceSelect:include/),
            ).not.toBeInTheDocument()
        })

        it('renders the info tooltip beside the "Narrow down audience" toggle', () => {
            renderComponent(true, { isV3Architecture: true })

            expect(screen.getByRole('tooltip')).toHaveTextContent(
                'By default, every shopper who triggers this flow gets the message. Add filters to target a specific group.',
            )
        })

        it('shows audience selects after toggling on', async () => {
            const user = userEvent.setup()
            renderComponent(true, { isV3Architecture: true })

            await user.click(
                screen.getByRole('switch', { name: 'Narrow down audience' }),
            )

            expect(screen.queryByText('Audience')).not.toBeInTheDocument()
            expect(
                screen.getByText('KlaviyoPermissionBanner'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/AudienceSelect:include/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/AudienceSelect:exclude/),
            ).toBeInTheDocument()
        })

        it('starts with the toggle on when narrow_audience_enabled is true in the form', () => {
            renderComponent(true, {
                isV3Architecture: true,
                defaultNarrowAudienceEnabled: true,
                defaultIncluded: ['list-1'],
            })

            const toggle = screen.getByRole('switch', {
                name: 'Narrow down audience',
            })
            expect(toggle).toBeChecked()
            expect(
                screen.getByText(/AudienceSelect:include/),
            ).toBeInTheDocument()
        })

        it('preserves the audience list ids in the form when toggling off (cleared at save time, not on toggle)', async () => {
            const user = userEvent.setup()
            renderComponent(true, {
                isV3Architecture: true,
                defaultNarrowAudienceEnabled: true,
                defaultIncluded: ['list-1'],
                defaultExcluded: ['list-2'],
            })

            expect(
                screen.getByText('AudienceSelect:include:["list-1"]'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('AudienceSelect:exclude:["list-2"]'),
            ).toBeInTheDocument()

            await user.click(
                screen.getByRole('switch', { name: 'Narrow down audience' }),
            )

            expect(
                screen.queryByText(/AudienceSelect:include/),
            ).not.toBeInTheDocument()

            await user.click(
                screen.getByRole('switch', { name: 'Narrow down audience' }),
            )

            expect(
                screen.getByText('AudienceSelect:include:["list-1"]'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('AudienceSelect:exclude:["list-2"]'),
            ).toBeInTheDocument()
        })
    })

    describe('when isV3Architecture is true and isAudienceRequired is true', () => {
        it('does not render the "Narrow down audience" toggle', () => {
            renderComponent(true, {
                isV3Architecture: true,
                isAudienceRequired: true,
            })

            expect(
                screen.queryByRole('switch', { name: 'Narrow down audience' }),
            ).not.toBeInTheDocument()
        })

        it('always renders the audience selects and permission banner', () => {
            renderComponent(true, {
                isV3Architecture: true,
                isAudienceRequired: true,
            })

            expect(
                screen.getByText('KlaviyoPermissionBanner'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/AudienceSelect:include/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/AudienceSelect:exclude/),
            ).toBeInTheDocument()
        })
    })
})
