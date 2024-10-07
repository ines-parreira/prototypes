import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import {useSearchParam} from 'hooks/useSearchParam'
import {assumeMock} from 'utils/testing'
import PostCompletionWizardModal from '../PostCompletionWizardModal'
import {WIZARD_POST_COMPLETION_STATE} from '../../constants'

jest.mock('hooks/useSearchParam')
const mockUseSearchParam = assumeMock(useSearchParam)

describe('<PostCompletionWizardModal />', () => {
    const mockSetSearchParam = jest.fn()

    beforeEach(() => {
        mockSetSearchParam.mockClear()
        mockUseSearchParam.mockImplementation(() => [null, mockSetSearchParam])
    })

    it('should render Configuration tab SuccessModal with appropriate props', () => {
        mockUseSearchParam.mockImplementation(() => [
            WIZARD_POST_COMPLETION_STATE.configuration,
            mockSetSearchParam,
        ])

        render(<PostCompletionWizardModal />)

        expect(screen.getByText('Great work!')).toBeInTheDocument()
        expect(
            screen.getByText(
                'We’ll let you know when your knowledge finishes syncing.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Explore AI Agent')).toBeInTheDocument()
    })

    it('should render Test tab SuccessModal with appropriate props', () => {
        mockUseSearchParam.mockImplementation(() => [
            WIZARD_POST_COMPLETION_STATE.test,
            mockSetSearchParam,
        ])

        render(<PostCompletionWizardModal />)

        expect(screen.getByText('Great work!')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Put AI Agent’s knowledge to the test in the playground before setting it live'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Try Test mode')).toBeInTheDocument()
    })

    it('should render Guidance tab HeroImageCarousel modal when slidesData is provided', () => {
        mockUseSearchParam.mockImplementation(() => [
            WIZARD_POST_COMPLETION_STATE.guidance,
            mockSetSearchParam,
        ])

        render(<PostCompletionWizardModal />)

        expect(
            screen.getByText(
                'Great work! Before setting it live, you can power AI Agent with more knowledge using Guidance'
            )
        ).toBeInTheDocument()
        expect(
            screen.getByAltText(
                'Write text-based instructions that explains your policies and processes so it can perform like a real agent.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should close modal and clears search param when button is clicked', () => {
        mockUseSearchParam.mockImplementation(() => [
            WIZARD_POST_COMPLETION_STATE.test,
            mockSetSearchParam,
        ])

        render(<PostCompletionWizardModal />)

        const closeButton = screen.getByRole('button', {name: /Try Test mode/i})
        fireEvent.click(closeButton)

        expect(mockSetSearchParam).toHaveBeenCalledWith(null)
    })

    it('should close modal and display knowledge carousel when configuration modal is clicked', () => {
        mockUseSearchParam.mockImplementation(() => [
            WIZARD_POST_COMPLETION_STATE.configuration,
            mockSetSearchParam,
        ])

        render(<PostCompletionWizardModal />)

        const closeButton = screen.getByRole('button', {
            name: /Explore AI Agent/i,
        })
        fireEvent.click(closeButton)

        expect(
            screen.getByText(
                'Before setting it live, you can power AI Agent with more knowledge using Guidance'
            )
        ).toBeInTheDocument()

        expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should close modal and change search param to knowledge', () => {
        mockUseSearchParam.mockImplementation(() => [
            WIZARD_POST_COMPLETION_STATE.knowledge,
            mockSetSearchParam,
        ])

        render(<PostCompletionWizardModal />)

        expect(
            screen.getByText(
                'Before setting it live, you can power AI Agent with more knowledge using Guidance'
            )
        ).toBeInTheDocument()

        const closeIcon = screen.getByText('close')

        fireEvent.click(closeIcon)

        expect(mockSetSearchParam).toHaveBeenCalledWith(
            WIZARD_POST_COMPLETION_STATE.knowledge
        )
    })
})
