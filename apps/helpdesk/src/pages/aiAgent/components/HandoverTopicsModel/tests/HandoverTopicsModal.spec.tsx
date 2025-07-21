import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useHandoverTopics } from '../../../hooks/useHandoverTopics'
import { HandoverTopicsModal } from '../HandoverTopicsModal'

jest.mock('../../../hooks/useHandoverTopics')

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const mockedUseHandoverTopics = jest.mocked(useHandoverTopics)

describe('HandoverTopicsModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        accountDomain: 'test-domain',
        shopName: 'test-store',
    }

    const defaultHookReturn = {
        excludedTopics: ['topic1', 'topic2'],
        setExcludedTopics: jest.fn(),
        isLoading: false,
        handleSave: jest.fn(),
        handleCancel: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseHandoverTopics.mockReturnValue(defaultHookReturn)
    })

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={store}>
                <HandoverTopicsModal {...defaultProps} {...props} />
            </Provider>,
        )
    }

    it('should render the component when open', () => {
        renderComponent()

        expect(screen.getByText('Handover Topics')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Define topics for AI Agent to always hand over to agents. We recommend limiting it to 5 or less.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /Learn more about handovers./ }),
        ).toHaveAttribute(
            'href',
            'https://docs.gorgias.com/en-US/customize-how-ai-agent-behaves-567324',
        )
    })

    it('should not render the component when closed', () => {
        renderComponent({ isOpen: false })

        expect(screen.queryByText('Handover Topics')).not.toBeInTheDocument()
    })

    it('should call handleCancel when cancel button is clicked', () => {
        renderComponent()

        const cancelButton = screen.getByRole('button', {
            name: 'Cancel',
        })
        fireEvent.click(cancelButton)

        expect(defaultHookReturn.handleCancel).toHaveBeenCalled()
    })

    it('should call handleSave when confirm button is clicked', () => {
        renderComponent()

        const confirmButton = screen.getByRole('button', {
            name: 'Confirm Topics',
        })
        fireEvent.click(confirmButton)

        expect(defaultHookReturn.handleSave).toHaveBeenCalled()
    })

    it('should disable cancel button when loading', () => {
        mockedUseHandoverTopics.mockReturnValue({
            ...defaultHookReturn,
            isLoading: true,
            excludedTopics: [],
            setExcludedTopics: jest.fn(),
        })

        renderComponent()

        const cancelButton = screen.getByRole('button', {
            name: 'Cancel',
        })
        expect(cancelButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should update local excluded topics when ListField changes', () => {
        renderComponent()

        const input = screen.getAllByPlaceholderText(
            'e.g. Invoice and billing, Data privacy, or Complaints',
        )[0]

        fireEvent.change(input, { target: { value: 'new topic' } })
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

        expect(defaultHookReturn.setExcludedTopics).toHaveBeenCalled()
    })

    it('should initialize hook with correct props', () => {
        renderComponent()

        expect(mockedUseHandoverTopics).toHaveBeenCalledWith({
            accountDomain: defaultProps.accountDomain,
            shopName: defaultProps.shopName,
            onClose: defaultProps.onClose,
        })
    })

    it('should close modal when handleSave is successful', async () => {
        const mockHandleSave = jest.fn().mockImplementation(async () => {
            await Promise.resolve()
        })

        mockedUseHandoverTopics.mockReturnValue({
            ...defaultHookReturn,
            handleSave: mockHandleSave,
        })

        renderComponent()

        const confirmButton = screen.getByRole('button', {
            name: 'Confirm Topics',
        })
        fireEvent.click(confirmButton)

        await waitFor(() => {
            expect(mockHandleSave).toHaveBeenCalled()
        })
    })
})
