import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {
    GorgiasChatIntegration,
    StoreIntegration,
} from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'

import { InstallationPlatformSettings } from './InstallationPlatformSettings'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/components/StorePicker',
    () => ({
        StorePicker: ({ error }: { error?: string }) => (
            <div aria-label="Store picker mock">
                {error && <span>{error}</span>}
            </div>
        ),
    }),
)

const storeIntegration = {
    id: 1,
    type: IntegrationType.Shopify,
    name: 'My Store',
} as StoreIntegration

const defaultProps = {
    isStoreRequired: false,
    onInstallationPlatformChange: jest.fn(),
    storeIntegration: undefined,
    gorgiasChatIntegrations: [] as GorgiasChatIntegration[],
    storeIntegrations: [] as StoreIntegration[],
    onStoreChange: jest.fn(),
    hasStoreError: false,
    isStoreOfShopifyType: undefined,
    hasShopifyScriptTagScope: undefined,
    retriggerOAuthFlow: jest.fn(),
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('InstallationPlatformSettings', () => {
    it('renders the heading', () => {
        render(<InstallationPlatformSettings {...defaultProps} />)

        expect(
            screen.getByText("Choose where you'll install your chat"),
        ).toBeInTheDocument()
    })

    it('renders both radio options', () => {
        render(<InstallationPlatformSettings {...defaultProps} />)

        expect(
            screen.getByLabelText('Ecommerce platforms', { selector: 'input' }),
        ).toBeInTheDocument()
        expect(
            screen.getByLabelText('Any other website', { selector: 'input' }),
        ).toBeInTheDocument()
    })

    it('selects "Any other website" when isStoreRequired is false', () => {
        render(
            <InstallationPlatformSettings
                {...defaultProps}
                isStoreRequired={false}
            />,
        )

        expect(
            screen.getByLabelText('Any other website', { selector: 'input' }),
        ).toBeChecked()
        expect(
            screen.getByLabelText('Ecommerce platforms', { selector: 'input' }),
        ).not.toBeChecked()
    })

    it('selects "Ecommerce platforms" when isStoreRequired is true', () => {
        render(
            <InstallationPlatformSettings
                {...defaultProps}
                isStoreRequired={true}
            />,
        )

        expect(
            screen.getByLabelText('Ecommerce platforms', { selector: 'input' }),
        ).toBeChecked()
        expect(
            screen.getByLabelText('Any other website', { selector: 'input' }),
        ).not.toBeChecked()
    })

    it('does not render StorePicker when isStoreRequired is false', () => {
        render(
            <InstallationPlatformSettings
                {...defaultProps}
                isStoreRequired={false}
            />,
        )

        expect(
            screen.queryByLabelText('Store picker mock'),
        ).not.toBeInTheDocument()
    })

    it('renders StorePicker when isStoreRequired is true', () => {
        render(
            <InstallationPlatformSettings
                {...defaultProps}
                isStoreRequired={true}
            />,
        )

        expect(screen.getByLabelText('Store picker mock')).toBeInTheDocument()
    })

    it('passes the required error to StorePicker when hasStoreError is true', () => {
        render(
            <InstallationPlatformSettings
                {...defaultProps}
                isStoreRequired={true}
                hasStoreError={true}
            />,
        )

        expect(screen.getByText('This field is required.')).toBeInTheDocument()
    })

    it('does not pass an error to StorePicker when hasStoreError is false', () => {
        render(
            <InstallationPlatformSettings
                {...defaultProps}
                isStoreRequired={true}
                hasStoreError={false}
            />,
        )

        expect(
            screen.queryByText('This field is required.'),
        ).not.toBeInTheDocument()
    })

    it('calls onInstallationPlatformChange when switching to "Any other website"', async () => {
        const user = userEvent.setup()
        render(
            <InstallationPlatformSettings
                {...defaultProps}
                isStoreRequired={true}
            />,
        )

        await user.click(
            screen.getByLabelText('Any other website', { selector: 'input' }),
        )

        expect(defaultProps.onInstallationPlatformChange).toHaveBeenCalledWith(
            'any-other-website',
        )
    })

    it('calls onInstallationPlatformChange when switching to "Ecommerce platforms"', async () => {
        const user = userEvent.setup()
        render(
            <InstallationPlatformSettings
                {...defaultProps}
                isStoreRequired={false}
            />,
        )

        await user.click(
            screen.getByLabelText('Ecommerce platforms', { selector: 'input' }),
        )

        expect(defaultProps.onInstallationPlatformChange).toHaveBeenCalledWith(
            'ecommerce-platforms',
        )
    })

    describe('Shopify permissions warning', () => {
        it('shows the warning when store is Shopify and lacks script tag scope', () => {
            render(
                <InstallationPlatformSettings
                    {...defaultProps}
                    isStoreRequired={true}
                    storeIntegration={storeIntegration}
                    isStoreOfShopifyType={true}
                    hasShopifyScriptTagScope={false}
                />,
            )

            expect(
                screen.getByText('update Shopify permissions'),
            ).toBeInTheDocument()
        })

        it('does not show the warning when hasShopifyScriptTagScope is true', () => {
            render(
                <InstallationPlatformSettings
                    {...defaultProps}
                    isStoreRequired={true}
                    storeIntegration={storeIntegration}
                    isStoreOfShopifyType={true}
                    hasShopifyScriptTagScope={true}
                />,
            )

            expect(
                screen.queryByText('update Shopify permissions'),
            ).not.toBeInTheDocument()
        })

        it('does not show the warning when isStoreOfShopifyType is false', () => {
            render(
                <InstallationPlatformSettings
                    {...defaultProps}
                    isStoreRequired={true}
                    storeIntegration={storeIntegration}
                    isStoreOfShopifyType={false}
                    hasShopifyScriptTagScope={false}
                />,
            )

            expect(
                screen.queryByText('update Shopify permissions'),
            ).not.toBeInTheDocument()
        })

        it('does not show the warning when storeIntegration is false', () => {
            render(
                <InstallationPlatformSettings
                    {...defaultProps}
                    isStoreRequired={true}
                    storeIntegration={false}
                    isStoreOfShopifyType={true}
                    hasShopifyScriptTagScope={false}
                />,
            )

            expect(
                screen.queryByText('update Shopify permissions'),
            ).not.toBeInTheDocument()
        })

        it('calls retriggerOAuthFlow when clicking "update Shopify permissions"', async () => {
            const user = userEvent.setup()
            render(
                <InstallationPlatformSettings
                    {...defaultProps}
                    isStoreRequired={true}
                    storeIntegration={storeIntegration}
                    isStoreOfShopifyType={true}
                    hasShopifyScriptTagScope={false}
                />,
            )

            await user.click(screen.getByText('update Shopify permissions'))

            expect(defaultProps.retriggerOAuthFlow).toHaveBeenCalledTimes(1)
        })
    })
})
