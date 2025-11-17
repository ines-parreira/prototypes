import { fireEvent, screen } from '@testing-library/react'
import { capitalize } from 'lodash'

import { integrationBase } from 'fixtures/integrations'
import { EmailProvider, IntegrationType } from 'models/integration/constants'
import type {
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import { OutboundVerificationStatusValue } from 'models/integration/types'
import { getOutboundEmailProviderSettingKey } from 'pages/integrations/integration/components/email/helpers'
import { renderWithRouter } from 'utils/testing'

import EmailIntegrationDeliverabilitySettings from '../EmailIntegrationDeliverabilitySettings'

const onChange = jest.fn()

type TestProps = {
    type: IntegrationType.Gmail | IntegrationType.Outlook
    sendViaAPI: boolean
    verified: boolean
    provider?: EmailProvider
}

const renderComponent = (props: TestProps) => {
    return renderWithRouter(
        <EmailIntegrationDeliverabilitySettings
            integration={getIntegration(props)}
            onChange={onChange}
        />,
    )
}

const getIntegration = ({
    type,
    sendViaAPI,
    verified,
    provider,
}: {
    type: IntegrationType.Gmail | IntegrationType.Outlook
    sendViaAPI: boolean
    verified: boolean
    provider?: EmailProvider
}): GmailIntegration | OutlookIntegration => {
    return {
        ...integrationBase,
        id: 1,
        type,
        name: `My shiny ${type} integration`,
        meta: {
            address: `support@${type}.com`,
            provider: provider ?? EmailProvider.Sendgrid,
            [getOutboundEmailProviderSettingKey(type)]: sendViaAPI,
            ...getProviderSettings(verified),
        },
    } as unknown as GmailIntegration | OutlookIntegration
}

const getProviderSettings = (domainVerified: boolean) => {
    return {
        outbound_verification_status: {
            domain: domainVerified
                ? OutboundVerificationStatusValue.Success
                : OutboundVerificationStatusValue.Unverified,
            single_sender: OutboundVerificationStatusValue.Unverified,
        },
    }
}

describe('<EmailIntegrationDeliverabilitySettings />', () => {
    const types: [IntegrationType.Gmail, IntegrationType.Outlook] = [
        IntegrationType.Gmail,
        IntegrationType.Outlook,
    ]

    describe.each(types)('for integration type: %s', (type) => {
        const providerName = capitalize(type)

        const nativeProviderLabel =
            'Send emails via Gorgias email delivery platform Recommended'
        const apiProviderLabel = `Send emails via ${providerName} API`

        it(`should render with the correct wording when the domain IS NOT verified`, () => {
            renderComponent({
                type,
                verified: false,
                sendViaAPI: true,
            })

            expect(
                screen.getByText('Outbound email delivery settings'),
            ).toBeInTheDocument()

            const nativeRadio = screen.getByRole('radio', {
                name: nativeProviderLabel,
            })

            const apiRadio = screen.getByRole('radio', {
                name: apiProviderLabel,
            })

            expect(
                screen.getByText(
                    'Send emails via Gorgias email delivery platform',
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Recommended')).toBeInTheDocument()

            expect(
                screen.getByText(
                    'Advanced configuration to handle higher volumes of emails.',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(`Improve email deliverability by`, {
                    exact: false,
                }),
            ).toBeInTheDocument()

            expect(
                screen.getByText(`verifying your domain`).getAttribute('href'),
            ).toBe('/app/settings/channels/email/1/outbound-verification')

            expect(nativeRadio).toBeInTheDocument()
            expect(nativeRadio).toBeDisabled()
            expect(nativeRadio).not.toBeChecked()

            expect(apiRadio).toBeInTheDocument()
            expect(apiRadio).not.toBeDisabled()
            expect(apiRadio).toBeChecked()
        })

        it(`should render with the correct wording when the domain IS verified`, () => {
            renderComponent({
                type,
                verified: true,
                sendViaAPI: false,
            })

            expect(
                screen.getByText('Outbound email delivery settings'),
            ).toBeInTheDocument()

            const nativeRadio = screen.getByRole('radio', {
                name: nativeProviderLabel,
            })

            const apiRadio = screen.getByRole('radio', {
                name: apiProviderLabel,
            })

            expect(
                screen.getByText(
                    'Send emails via Gorgias email delivery platform',
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Recommended')).toBeInTheDocument()

            expect(
                screen.getByText(
                    'Advanced configuration to handle higher volumes of emails.',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    `Your emails are now being sent via Gorgias’ email delivery platform to prevent deliverability issues that can occur when using ${providerName}’s API with high email volumes.`,
                ),
            ).toBeInTheDocument()

            expect(nativeRadio).toBeInTheDocument()
            expect(nativeRadio).not.toBeDisabled()
            expect(nativeRadio).toBeChecked()

            expect(apiRadio).toBeInTheDocument()
            expect(apiRadio).not.toBeDisabled()
            expect(apiRadio).not.toBeChecked()
        })

        it(`should render with the correct wording when the domain IS verified but API is selected`, () => {
            renderComponent({
                type,
                verified: true,
                sendViaAPI: true,
            })

            expect(
                screen.getByText('Outbound email delivery settings'),
            ).toBeInTheDocument()

            const nativeRadio = screen.getByRole('radio', {
                name: nativeProviderLabel,
            })

            const apiRadio = screen.getByRole('radio', {
                name: apiProviderLabel,
            })

            expect(
                screen.getByText(
                    'Send emails via Gorgias email delivery platform',
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Recommended')).toBeInTheDocument()

            expect(
                screen.getByText(
                    'A suitable delivery platform for most email operations.',
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    `To avoid deliverability issues that can occur when using ${providerName}’s API, it is recommended to use Gorgias’ email delivery platform to send your emails. This ensures successful delivery and tracking.`,
                ),
            ).toBeInTheDocument()

            expect(nativeRadio).toBeInTheDocument()
            expect(nativeRadio).not.toBeDisabled()
            expect(nativeRadio).not.toBeChecked()

            expect(apiRadio).toBeInTheDocument()
            expect(apiRadio).not.toBeDisabled()
            expect(apiRadio).toBeChecked()
        })

        it(`should handle value change correctly`, () => {
            renderComponent({
                type,
                verified: true,
                sendViaAPI: true,
            })

            expect(
                screen.getByText('Outbound email delivery settings'),
            ).toBeInTheDocument()

            const nativeRadio = screen.getByRole('radio', {
                name: nativeProviderLabel,
            })

            const apiRadio = screen.getByRole('radio', {
                name: apiProviderLabel,
            })

            expect(nativeRadio).toBeInTheDocument()
            expect(nativeRadio).not.toBeDisabled()
            expect(nativeRadio).not.toBeChecked()

            expect(apiRadio).toBeInTheDocument()
            expect(apiRadio).not.toBeDisabled()
            expect(apiRadio).toBeChecked()

            fireEvent.click(nativeRadio)
            expect(onChange).toHaveBeenCalledWith(false)

            fireEvent.click(apiRadio)
            expect(onChange).toHaveBeenCalledWith(true)
        })
    })

    it('should render the correct domain verification URL for Sendgrid', () => {
        renderComponent({
            type: IntegrationType.Gmail,
            verified: false,
            sendViaAPI: true,
            provider: EmailProvider.Sendgrid,
        })

        expect(
            screen.getByText('Outbound email delivery settings'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('verifying your domain').getAttribute('href'),
        ).toBe('/app/settings/channels/email/1/outbound-verification')
    })

    it('should render the correct domain verification URL for Mailgun', () => {
        renderComponent({
            type: IntegrationType.Gmail,
            verified: false,
            sendViaAPI: true,
            provider: EmailProvider.Mailgun,
        })

        expect(
            screen.getByText('Outbound email delivery settings'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('verifying your domain').getAttribute('href'),
        ).toBe('/app/settings/channels/email/1/dns')
    })

    it('should have a correct default value', () => {
        renderComponent({
            type: IntegrationType.Email as IntegrationType.Gmail,
            verified: true,
            sendViaAPI: true,
        })

        const nativeProviderLabel =
            'Send emails via Gorgias email delivery platform Recommended'
        const apiProviderLabel = `Send emails via Email API`

        const nativeRadio = screen.getByRole('radio', {
            name: nativeProviderLabel,
        })

        const apiRadio = screen.getByRole('radio', {
            name: apiProviderLabel,
        })

        expect(nativeRadio).toBeInTheDocument()
        expect(nativeRadio).not.toBeDisabled()
        expect(nativeRadio).not.toBeChecked()

        expect(apiRadio).toBeInTheDocument()
        expect(apiRadio).not.toBeDisabled()
        expect(apiRadio).toBeChecked()
    })
})
