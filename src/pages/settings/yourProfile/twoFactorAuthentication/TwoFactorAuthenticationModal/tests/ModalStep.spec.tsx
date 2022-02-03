import React from 'react'
import {render} from '@testing-library/react'
import ModalStep from '../ModalStep'

describe('<ModalStep />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it.each([1, 2, 3, 999999])(
            'should render the appropriate step',
            (currentStep) => {
                const {container} = render(
                    <ModalStep currentStep={currentStep} />
                )
                expect(container.firstChild).toMatchSnapshot()
            }
        )
    })
})
