import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { AudienceCard } from './AudienceCard'

jest.mock('AIJourney/formFields', () => ({
    AudienceSelect: ({ type }: { type: string }) => (
        <div>AudienceSelect:{type}</div>
    ),
}))

jest.mock(
    'AIJourney/components/KlaviyoPermissionBanner/KlaviyoPermissionBanner',
    () => ({
        KlaviyoPermissionBanner: () => <div>KlaviyoPermissionBanner</div>,
    }),
)

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(() => ({
        currentIntegration: { id: 1, name: 'Test Store' },
        shopName: 'test-store',
    })),
}))

const renderComponent = (
    isFormReady: boolean,
    { isV3Architecture = false }: { isV3Architecture?: boolean } = {},
) => {
    const Wrapper = () => {
        const methods = useForm()
        return (
            <FormProvider {...methods}>
                <AudienceCard
                    isFormReady={isFormReady}
                    isV3Architecture={isV3Architecture}
                />
            </FormProvider>
        )
    }

    return render(<Wrapper />)
}

describe('<AudienceCard />', () => {
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
                screen.queryByText('AudienceSelect:include'),
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
                screen.getByText('AudienceSelect:include'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('AudienceSelect:exclude'),
            ).toBeInTheDocument()
        })
    })

    describe('when isV3Architecture is true', () => {
        it('renders include/exclude audience selects without the legacy card header', () => {
            renderComponent(true, { isV3Architecture: true })

            expect(screen.queryByText('Audience')).not.toBeInTheDocument()
            expect(
                screen.getByText('KlaviyoPermissionBanner'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('AudienceSelect:include'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('AudienceSelect:exclude'),
            ).toBeInTheDocument()
        })
    })
})
