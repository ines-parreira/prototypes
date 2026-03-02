import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import type { Magento2Integration } from 'models/integration/types'

import ActionButtons from '../ActionButtons'

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            adminURLSuffix: '',
        },
    })
    return <FormProvider {...methods}>{children}</FormProvider>
}

const renderWithFormProvider = (element: React.ReactElement) => {
    return render(<FormWrapper>{element}</FormWrapper>)
}

describe('<ActionButtons />', () => {
    const minProps = {
        onDelete: jest.fn(),
        integration: {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
            },
        } as Magento2Integration,
        redirectUri: 'https://example.com/auth',
        isSubmitting: false,
    }

    beforeEach(() => {
        jest.restoreAllMocks()
        ;(window as unknown as { location: Location }).location = {
            href: '',
        } as Location
    })

    it('should render save and delete buttons by default', () => {
        renderWithFormProvider(<ActionButtons {...minProps} />)

        expect(
            screen.getByRole('button', { name: 'Save Changes' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete Store' }),
        ).toBeInTheDocument()
    })

    it('should disable save button when form is not dirty or admin URL suffix is empty', () => {
        renderWithFormProvider(<ActionButtons {...minProps} />)

        const saveButton = screen.getByRole('button', { name: 'Save Changes' })
        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should show reconnect button when integration is not active and is manual', () => {
        const integration = {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
                is_manual: true,
            },
            deactivated_datetime: '2024-03-20T10:00:00Z',
        } as Magento2Integration

        renderWithFormProvider(
            <ActionButtons {...minProps} integration={integration} />,
        )

        const reconnectButton = screen.getByRole('button', {
            name: 'Reconnect',
        })
        expect(reconnectButton).toBeInTheDocument()
    })

    it('should show reconnect button with confirmation when integration is not active and is not manual', () => {
        const integration = {
            meta: {
                store_url: 'https://test-store.com',
                admin_url_suffix: 'admin',
                is_manual: false,
            },
            deactivated_datetime: '2024-03-20T10:00:00Z',
        } as Magento2Integration

        renderWithFormProvider(
            <ActionButtons {...minProps} integration={integration} />,
        )

        const reconnectButton = screen.getByRole('button', {
            name: 'Reconnect',
        })
        expect(reconnectButton).toBeInTheDocument()
        fireEvent.click(reconnectButton)
        expect(
            screen.getByText(
                'You first need to delete the integration on your Magento2 store so that you can re-add it using this button',
            ),
        ).toBeInTheDocument()
    })

    it('should handle delete button click', () => {
        renderWithFormProvider(<ActionButtons {...minProps} />)

        fireEvent.click(screen.getByRole('button', { name: 'Delete Store' }))
        expect(minProps.onDelete).toHaveBeenCalled()
    })

    it('should disable all buttons when submitting', () => {
        renderWithFormProvider(
            <ActionButtons {...minProps} isSubmitting={true} />,
        )

        const saveButton = screen.getByRole('button', {
            name: 'Loading... Save Changes',
        })
        const deleteButton = screen.getByRole('button', {
            name: 'Delete Store',
        })

        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        expect(deleteButton).toHaveAttribute('aria-disabled', 'true')
    })
})
