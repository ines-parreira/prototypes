import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import RecoveryCodesStep from '../RecoveryCodesStep'
import {recoveryCodes as recoveryCodesFixture} from '../../../../../../../../fixtures/recoveryCodes'

describe('<RecoveryCodesStep />', () => {
    const waitForLoadingSpinnersToDisappear = async () => {
        await waitFor(() => {
            expect(() => screen.queryAllByText('Loading...')).toHaveLength(0)
        })
    }

    describe('render()', () => {
        it.each([true, false])(
            'should render the component with the recovery codes',
            async (isRecoveryCodesSaved: boolean) => {
                const {container} = render(
                    <RecoveryCodesStep
                        recoveryCodes={recoveryCodesFixture}
                        isRecoveryCodesSaved={isRecoveryCodesSaved}
                        setIsRecoveryCodesSaved={jest.fn()}
                    />
                )

                await waitForLoadingSpinnersToDisappear()

                expect(container).toMatchSnapshot()
            }
        )
    })

    describe('clipboard copy action', () => {
        it('should trigger copy of recovery codes', async () => {
            global.document.execCommand = jest.fn()

            render(
                <RecoveryCodesStep
                    recoveryCodes={recoveryCodesFixture}
                    isRecoveryCodesSaved={false}
                    setIsRecoveryCodesSaved={jest.fn()}
                />
            )

            await waitForLoadingSpinnersToDisappear()

            const copyButton = screen.getByText(/Copy/)
            fireEvent.click(copyButton)

            expect(global.document.execCommand).toHaveBeenCalledWith('copy')
        })
    })

    describe('handleDownload()', () => {
        const mockAnchor = () => {
            const anchorMocked = {
                href: '',
                setAttribute: jest.fn(),
                click: jest.fn(),
                remove: jest.fn(),
            }

            const anchorElementSpy = jest
                .spyOn(global.document, 'createElement')
                // @ts-ignore eslint-disable-next-line
                .mockReturnValueOnce(anchorMocked)
            global.document.body.appendChild = jest.fn()

            return {anchorMocked, anchorElementSpy}
        }

        it('should trigger download of recovery codes', async () => {
            render(
                <RecoveryCodesStep
                    recoveryCodes={recoveryCodesFixture}
                    isRecoveryCodesSaved={false}
                    setIsRecoveryCodesSaved={jest.fn()}
                />
            )

            await waitForLoadingSpinnersToDisappear()

            const {anchorMocked, anchorElementSpy} = mockAnchor()

            const downloadButton = screen.getByText(/Download/)
            fireEvent.click(downloadButton)

            expect(anchorElementSpy).toBeCalledWith('a')
            expect(global.document.body.appendChild).toBeCalledWith(
                anchorMocked
            )

            expect(anchorMocked.setAttribute).toBeCalledTimes(2)
            expect(anchorMocked.setAttribute.mock.calls).toMatchSnapshot()

            expect(anchorMocked.click).toBeCalledTimes(1)
            expect(anchorMocked.remove).toBeCalledTimes(1)
        })
    })
})
