import React from 'react'
import {render} from '@testing-library/react'

import * as useLocalStorage from 'hooks/useLocalStorage'
import {CampaignFooter} from '../CampaignFooter'

const useLocalStorageSpy = jest.spyOn(useLocalStorage, 'default') as jest.Mock

describe('<CampaignFooter />', () => {
    const defaultProps = {
        isCampaignValid: true,
        isLightCampaign: false,
        isUpdate: true,
        onSave: jest.fn(),
        onDiscard: jest.fn(),
        onDelete: jest.fn(),
        onDuplicate: jest.fn(),
    }

    const renderComponent = (props: any) => {
        return render(<CampaignFooter {...props} />)
    }

    describe('Light campaign affects button visibility', () => {
        it('renders all buttons when is update, but not light campaign', () => {
            const {getByText} = renderComponent(defaultProps)

            expect(getByText('Update Campaign')).toBeInTheDocument()
            expect(getByText('Duplicate Campaign')).toBeInTheDocument()
            expect(getByText('Delete Campaign')).toBeInTheDocument()
        })

        it('renders only update button when is update and light campaign', () => {
            const {getByText, queryByText} = renderComponent({
                ...defaultProps,
                isShopifyStore: true,
                isLightCampaign: true,
            })

            expect(getByText('Update Campaign')).toBeInTheDocument()
            expect(queryByText('Duplicate Campaign')).not.toBeInTheDocument()
            expect(queryByText('Delete Campaign')).not.toBeInTheDocument()
        })

        it('renders update and duplicate button for non-Shopify', () => {
            const {getByText, queryByText} = renderComponent({
                ...defaultProps,
                isLightCampaign: true,
            })

            expect(getByText('Update Campaign')).toBeInTheDocument()
            expect(getByText('Duplicate Campaign')).toBeInTheDocument()
            expect(queryByText('Delete Campaign')).not.toBeInTheDocument()
        })

        it('renders all buttons when is create, but light campaign attribute is wrongly true', () => {
            const {getByText} = renderComponent({
                ...defaultProps,
                isUpdate: false,
                isLightCampaign: true,
            })

            expect(getByText('Create')).toBeInTheDocument()
            expect(getByText('Cancel')).toBeInTheDocument()
        })

        it('should not render duplicate button when create is disabled', () => {
            const {queryByText} = renderComponent({
                ...defaultProps,
                isCreateDisabled: true,
            })

            expect(queryByText('Duplicate Campaign')).not.toBeInTheDocument()
        })

        it('renders delete button with light modal when over campaigns limit', () => {
            const {getByText} = renderComponent({
                ...defaultProps,
                isOverCampaignsLimit: true,
            })

            getByText('Delete Campaign').click()

            expect(getByText('Learn About Convert')).toBeInTheDocument()
        })

        it('renders delete button without light modal when over campaigns limit, but dismissed', () => {
            useLocalStorageSpy.mockReturnValue([true])

            const {getByText, queryByText} = renderComponent({
                ...defaultProps,
                isOverCampaignsLimit: true,
            })

            getByText('Delete Campaign').click()

            expect(queryByText('Learn About Convert')).not.toBeInTheDocument()
            expect(getByText('Confirm')).toBeInTheDocument()
        })
    })

    describe('Campaign create', () => {
        const onSave = jest.fn()

        it('blocks the create button when creation is disabled', () => {
            const {getByRole} = renderComponent({
                ...defaultProps,
                onSave,
                isCreateDisabled: true,
                isUpdate: false,
            })

            expect(getByRole('button', {name: 'Create'})).toHaveAttribute(
                'aria-disabled'
            )
            expect(onSave).not.toHaveBeenCalled()
        })

        it('blocks creation when user manually enables button', () => {
            const {getByRole, getByText} = renderComponent({
                ...defaultProps,
                onSave,
                isCreateDisabled: true,
                isUpdate: false,
            })

            const button = getByRole('button', {name: 'Create'})
            button.removeAttribute('aria-disabled')
            button.removeAttribute('class')

            button.click()

            const activateButton = getByText('Create & Activate')
            activateButton.click()

            expect(onSave).not.toHaveBeenCalled()
        })
    })
})
