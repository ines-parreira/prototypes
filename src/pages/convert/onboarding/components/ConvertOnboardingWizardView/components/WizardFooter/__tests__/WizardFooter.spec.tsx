import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {BrowserRouter as Router} from 'react-router-dom'
import WizardFooter from '../WizardFooter'

describe('WizardFooter', () => {
    const integrationId = 123
    const isLoading = false
    const handleNextStep = jest.fn()
    const handleBack = jest.fn()

    test('renders correctly with buttons', () => {
        const {getByText} = render(
            <Router>
                <WizardFooter
                    integrationId={integrationId}
                    isLoading={isLoading}
                    handleNextStep={handleNextStep}
                    handleBack={handleBack}
                />
            </Router>
        )

        expect(getByText('Save & Customize Later')).toBeInTheDocument()
        expect(getByText('Previous')).toBeInTheDocument()
        expect(getByText('Finish Setup')).toBeInTheDocument()
    })

    test('calls handleNextStep when Finish Setup button is clicked', () => {
        const {getByText} = render(
            <Router>
                <WizardFooter
                    integrationId={integrationId}
                    isLoading={isLoading}
                    handleNextStep={handleNextStep}
                    handleBack={handleBack}
                />
            </Router>
        )

        fireEvent.click(getByText('Finish Setup'))

        expect(handleNextStep).toHaveBeenCalledTimes(1)
    })

    test('calls handleBack when Previous button is clicked', () => {
        const {getByText} = render(
            <Router>
                <WizardFooter
                    integrationId={integrationId}
                    isLoading={isLoading}
                    handleNextStep={handleNextStep}
                    handleBack={handleBack}
                />
            </Router>
        )

        fireEvent.click(getByText('Previous'))

        expect(handleBack).toHaveBeenCalledTimes(1)
    })
})
