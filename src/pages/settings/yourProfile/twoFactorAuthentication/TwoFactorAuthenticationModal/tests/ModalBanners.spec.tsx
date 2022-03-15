import React from 'react'
import {render} from '@testing-library/react'
import ModalBanners from '../ModalBanners'

describe('<ModalBanners />', () => {
    describe('render()', () => {
        it.each([
            {currentStep: 1, errorText: 'Foo error banner', isEnforced: true},
            {currentStep: 1, errorText: 'Foo error banner', isEnforced: false},
            {currentStep: 1, errorText: '', isEnforced: true},
            {currentStep: 1, errorText: '', isEnforced: false},
            {currentStep: 2, errorText: 'Foo error banner', isEnforced: false},
            {currentStep: 2, errorText: '', isEnforced: false},
            {currentStep: 3, errorText: 'Foo error banner', isEnforced: false},
            {currentStep: 3, errorText: '', isEnforced: false},
            {
                currentStep: 999,
                errorText: 'Foo error banner',
                isEnforced: false,
            },
            {currentStep: 999, errorText: '', isEnforced: false},
        ])(
            'should render the appropriate banners based on current step and error text',
            async (testingValue) => {
                const {container, findByText} = render(
                    <ModalBanners
                        currentStep={testingValue.currentStep}
                        errorText={testingValue.errorText}
                        isEnforced={testingValue.isEnforced}
                    />
                )

                if (testingValue.errorText) {
                    await findByText(testingValue.errorText)
                }

                expect(container).toMatchSnapshot(
                    `${testingValue.currentStep}-${testingValue.errorText}`
                )
            }
        )
    })
})
