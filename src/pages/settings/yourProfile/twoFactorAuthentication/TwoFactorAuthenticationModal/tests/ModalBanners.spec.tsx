import React from 'react'
import {render} from '@testing-library/react'
import ModalBanners from '../ModalBanners'

describe('<ModalBanners />', () => {
    describe('render()', () => {
        it.each([
            {currentStep: 1, errorText: 'Foo error banner'},
            {currentStep: 1, errorText: ''},
            {currentStep: 2, errorText: 'Foo error banner'},
            {currentStep: 2, errorText: ''},
            {currentStep: 3, errorText: 'Foo error banner'},
            {currentStep: 3, errorText: ''},
            {
                currentStep: 999,
                errorText: 'Foo error banner',
            },
            {currentStep: 999, errorText: ''},
        ])(
            'should render the appropriate banners based on current step and error text',
            async (testingValue) => {
                const {container, findByText} = render(
                    <ModalBanners
                        currentStep={testingValue.currentStep}
                        errorText={testingValue.errorText}
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

        it('should render the initial banner info text', async () => {
            const {container, findByText} = render(
                <ModalBanners
                    currentStep={1}
                    initialBannerInfoText="Foo bar initial text"
                />
            )

            await findByText('Foo bar initial text')

            expect(container).toMatchSnapshot()
        })
    })
})
