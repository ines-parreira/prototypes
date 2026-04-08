import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams } from 'react-router-dom'

import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'

import useTrackOrderFlow from '../../../legacy/trackOrder/hooks/useTrackOrderFlow'
import { TrackOrderFlowView } from '../TrackOrderFlowView'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('../../../legacy/trackOrder/hooks/useTrackOrderFlow')

jest.mock(
    '../../components/OrderManagementFlowHeader/OrderManagementFlowHeader',
    () => ({
        OrderManagementFlowHeader: ({
            onSave,
            isSaveDisabled,
        }: {
            onSave: () => void
            isSaveDisabled: boolean
        }) => (
            <button onClick={onSave} disabled={isSaveDisabled}>
                Save
            </button>
        ),
    }),
)

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseTrackOrderFlow = useTrackOrderFlow as jest.MockedFunction<
    typeof useTrackOrderFlow
>
const mockHandleTrackOrderFlowUpdate = jest.fn()

describe('TrackOrderFlowView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({ shopName: 'test-store' })
        mockUseTrackOrderFlow.mockReturnValue({
            trackOrderFlow: {
                ...selfServiceConfiguration1.trackOrderPolicy,
                unfulfilledMessage: { text: '', html: '' },
            },
            isUpdatePending: false,
            selfServiceConfiguration: selfServiceConfiguration1,
            storeIntegration: undefined,
            handleTrackOrderFlowUpdate: mockHandleTrackOrderFlowUpdate,
        })
    })

    it('should render loading state when data is not yet available', () => {
        mockUseTrackOrderFlow.mockReturnValue({
            trackOrderFlow: undefined,
            isUpdatePending: false,
            selfServiceConfiguration: undefined,
            storeIntegration: undefined,
            handleTrackOrderFlowUpdate: mockHandleTrackOrderFlowUpdate,
        })

        render(<TrackOrderFlowView />)

        expect(
            screen.queryByText('Response for unfulfilled orders'),
        ).not.toBeInTheDocument()
    })

    it('should render the configuration form when data is loaded', () => {
        render(<TrackOrderFlowView />)

        expect(
            screen.getByText('Response for unfulfilled orders'),
        ).toBeInTheDocument()
        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(
            screen.getByText(/Display a custom message/i),
        ).toBeInTheDocument()
    })

    it('should disable Save button when form is not dirty', () => {
        render(<TrackOrderFlowView />)

        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('should enable Save button after modifying the textarea', async () => {
        const user = userEvent.setup()
        render(<TrackOrderFlowView />)

        await user.type(screen.getByRole('textbox'), 'custom message')

        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    })

    it('should call handleTrackOrderFlowUpdate with the updated message on save', async () => {
        const user = userEvent.setup()
        render(<TrackOrderFlowView />)

        await user.type(screen.getByRole('textbox'), 'custom message')
        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(mockHandleTrackOrderFlowUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                unfulfilledMessage: {
                    text: 'custom message',
                    html: 'custom message',
                },
            }),
        )
    })
})
