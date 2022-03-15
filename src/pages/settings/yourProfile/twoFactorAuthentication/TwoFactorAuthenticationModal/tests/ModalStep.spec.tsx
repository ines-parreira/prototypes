import React from 'react'
import {render} from '@testing-library/react'
import ModalStep from '../ModalStep'
import {recoveryCodes as recoveryCodesFixture} from '../../../../../../fixtures/recoveryCodes'

jest.mock('../ModalSteps/QRCodeStep/QRCodeStep', () => () => (
    <div>QRCode step mocked</div>
))

jest.mock(
    '../ModalSteps/ValidateVerificationCodeStep/ValidateVerificationCodeStep',
    () => () => <div>Validate Verification Code step mocked</div>
)

jest.mock('../ModalSteps/RecoveryCodesStep/RecoveryCodesStep', () => () => (
    <div>Validate Verification Code step mocked</div>
))

describe('<ModalStep />', () => {
    describe('render()', () => {
        it.each([1, 2, 3, 999999])(
            'should render the appropriate step',
            (currentStep) => {
                const {container} = render(
                    <ModalStep
                        currentStep={currentStep}
                        errorText={''}
                        setErrorText={jest.fn()}
                        setVerificationCode={jest.fn()}
                        setIsLoading={jest.fn()}
                        recoveryCodes={recoveryCodesFixture}
                        isRecoveryCodesSaved={true}
                        setIsRecoveryCodesSaved={jest.fn()}
                    />
                )

                expect(container.firstChild).toMatchSnapshot()
            }
        )
    })
})
