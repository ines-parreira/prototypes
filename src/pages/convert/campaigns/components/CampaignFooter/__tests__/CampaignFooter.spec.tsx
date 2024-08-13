/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from 'react'
import {render, waitFor, act} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as useDismissFlag from 'hooks/useDismissFlag'
import * as useLocalStorage from 'hooks/useLocalStorage'

import * as useIsConvertABVariantsEnabled from 'pages/convert/common/hooks/useIsConvertABVariantsEnabled'

import {CampaignFooter} from '../CampaignFooter'

jest.mock('pages/convert/common/hooks/useIsConvertABVariantsEnabled')
jest.mock('hooks/useDismissFlag')

const useLocalStorageSpy = jest.spyOn(useLocalStorage, 'default') as jest.Mock

describe('<CampaignFooter />', () => {
    const onVariantCreateMock = jest.fn()
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

    beforeAll(() => {
        jest.spyOn(useDismissFlag, 'useDismissFlag').mockImplementation(
            () =>
                ({
                    isDismissed: false,
                    dismiss: jest.fn(),
                } as any)
        )
    })

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
            expect(queryByText('Create A/B Test')).not.toBeInTheDocument()
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
                isOverLimit: true,
            })

            getByText('Delete Campaign').click()

            expect(getByText('Learn About Convert')).toBeInTheDocument()
        })

        it('renders delete button without light modal when over campaigns limit, but dismissed', () => {
            useLocalStorageSpy.mockReturnValue([true])

            const {getByText, queryByText} = renderComponent({
                ...defaultProps,
                isOverLimit: true,
            })

            getByText('Delete Campaign').click()

            expect(queryByText('Learn About Convert')).not.toBeInTheDocument()
            expect(getByText('Confirm')).toBeInTheDocument()
        })
    })

    describe('Campaign update, user can create A/B Test', () => {
        beforeEach(() => {
            jest.spyOn(
                useIsConvertABVariantsEnabled,
                'useIsConvertABVariantsEnabled'
            ).mockImplementation(() => true)

            jest.spyOn(useDismissFlag, 'useDismissFlag').mockImplementation(
                () =>
                    ({
                        isDismissed: false,
                        dismiss: jest.fn(),
                    } as any)
            )
        })

        it('renders', () => {
            const {getByText} = renderComponent({
                ...defaultProps,
                canCreateABVariants: true,
            })

            expect(getByText('Update Campaign')).toBeInTheDocument()
            expect(getByText('Duplicate Campaign')).toBeInTheDocument()
            expect(getByText('Create A/B Test')).toBeInTheDocument()
        })

        it('can open create a/b test info modal and create a/b test', async () => {
            const {getByText, getByRole} = renderComponent({
                ...defaultProps,
                canCreateABVariants: true,
                onABVariantCreate: onVariantCreateMock,
            })

            act(() => {
                userEvent.click(getByRole('button', {name: 'Create A/B Test'}))
            })

            await waitFor(() => {
                expect(
                    getByText('Create an A/B test from a campaign')
                ).toBeInTheDocument()

                userEvent.click(getByRole('button', {name: 'Create A/B test'}))

                expect(onVariantCreateMock).toHaveBeenCalledTimes(1)
            })
        })

        it('can dismiss modal', async () => {
            const {queryByText, getByRole} = renderComponent({
                ...defaultProps,
                canCreateABVariants: true,
            })

            act(() => {
                userEvent.click(getByRole('button', {name: 'Create A/B Test'}))
            })

            await waitFor(() => {
                userEvent.click(getByRole('button', {name: 'Cancel'}))
            })

            await waitFor(() => {
                expect(
                    queryByText('Create an A/B test from a campaign')
                ).not.toBeInTheDocument()
            })
        })

        it('creates a/b test when modal is dismissed', () => {
            jest.spyOn(useDismissFlag, 'useDismissFlag').mockImplementation(
                () =>
                    ({
                        isDismissed: true,
                        dismiss: jest.fn(),
                    } as any)
            )

            const {getByRole} = renderComponent({
                ...defaultProps,
                canCreateABVariants: true,
                onABVariantCreate: onVariantCreateMock,
            })

            act(() => {
                userEvent.click(getByRole('button', {name: 'Create A/B Test'}))
            })

            expect(onVariantCreateMock).toHaveBeenCalledTimes(0)
        })
    })

    describe('Campaign create', () => {
        const onSave = jest.fn()

        it('blocks the create button when creation is disabled', () => {
            const {getByRole, getByText} = renderComponent({
                ...defaultProps,
                onSave,
                isCreateDisabled: true,
                isUpdate: false,
            })

            expect(getByRole('button', {name: 'Create'})).toHaveAttribute(
                'aria-disabled'
            )
            expect(getByText('arrow_drop_down')).toBeInTheDocument()
            expect(onSave).not.toHaveBeenCalled()
        })

        it('cannot activate campaign', () => {
            const {getByRole, queryByText} = renderComponent({
                ...defaultProps,
                onSave,
                isCreateDisabled: false,
                isUpdate: false,
                allowActivate: false,
            })

            expect(getByRole('button', {name: 'Create'})).toHaveAttribute(
                'aria-disabled'
            )
            expect(queryByText('arrow_drop_down')).not.toBeInTheDocument()
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
