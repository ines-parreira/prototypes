import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import TwoFactorAuthenticationModal from '../TwoFactorAuthenticationModal'

describe('<TwoFactorAuthenticationModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const minProps: ComponentProps<typeof TwoFactorAuthenticationModal> = {
        isOpen: true,
        setIsOpen: jest.fn(),
    }

    describe('render()', () => {
        it('should not render the modal', () => {
            const {baseElement} = render(
                <TwoFactorAuthenticationModal {...minProps} isOpen={false} />
            )
            expect(baseElement).toMatchSnapshot()
        })

        it('should render the modal', async () => {
            const {baseElement} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with QR Code step', async () => {
            const {baseElement} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with Validate authenticator code step', async () => {
            const {findByText, baseElement} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            const continueButton = await findByText(/Continue/)
            fireEvent.click(continueButton)

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with Recovery codes step', async () => {
            const {findByText, baseElement} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            let continueButton = await findByText(/Continue/)
            fireEvent.click(continueButton)

            continueButton = await findByText(/Continue/)
            fireEvent.click(continueButton)

            expect(baseElement).toMatchSnapshot()
        })

        it('should render modal with QR code step after pressing back button', async () => {
            const {findByText, baseElement} = render(
                <TwoFactorAuthenticationModal {...minProps} />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            const continueButton = await findByText(/Continue/)
            fireEvent.click(continueButton)

            const backButton = await findByText(/Back/)
            fireEvent.click(backButton)

            expect(baseElement).toMatchSnapshot()
        })

        it('should call setIsOpen with false value which closes the modal on cancel', async () => {
            const setIsOpenMock = jest.fn()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            const useStateMock: any = (useState: any) => [
                useState,
                setIsOpenMock,
            ]
            jest.spyOn(React, 'useState').mockImplementation(useStateMock)

            const {findByText, baseElement} = render(
                <TwoFactorAuthenticationModal
                    {...minProps}
                    isOpen
                    setIsOpen={setIsOpenMock}
                />
            )

            // Wait until the show class is added to the modal
            await waitFor(() =>
                expect(
                    baseElement.getElementsByClassName('modal show').length
                ).toBe(1)
            )

            const cancelButton = await findByText(/Cancel/)
            fireEvent.click(cancelButton)

            expect(setIsOpenMock).toHaveBeenCalledWith(false)
        })
    })
})
