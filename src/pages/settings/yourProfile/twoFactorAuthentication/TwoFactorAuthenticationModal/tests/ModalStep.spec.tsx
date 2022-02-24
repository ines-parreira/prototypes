import React from 'react'
import {render} from '@testing-library/react'
import ModalStep from '../ModalStep'

jest.mock('../ModalSteps/QRCodeStep/QRCodeStep', () => () => (
    <div>QRCode step mocked</div>
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
                        setErrorText={jest.fn}
                    />
                )
                expect(container.firstChild).toMatchSnapshot()
            }
        )
    })
})
