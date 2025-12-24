import { useFormContext } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import RoutingTemplateRadioFieldSet from '../RoutingTemplateRadioFieldSet'
import {
    getDefaultIvrFlow,
    getRouteToQueueFlow,
    getSendToVoicemailFlow,
} from '../utils'

jest.mock('@repo/forms')
jest.mock('../utils', () => ({
    getRouteToQueueFlow: jest.fn(),
    getDefaultIvrFlow: jest.fn(),
    getSendToVoicemailFlow: jest.fn(),
}))

const mockGetRouteToQueueFlow = assumeMock(getRouteToQueueFlow)
const mockGetDefaultIvrFlow = assumeMock(getDefaultIvrFlow)
const mockGetSendToVoicemailFlow = assumeMock(getSendToVoicemailFlow)

describe('RoutingTemplateRadioFieldSet', () => {
    const mockSetValue = jest.fn()
    const mockWatch = jest.fn()
    const useFormContextMock = assumeMock(useFormContext)

    beforeEach(() => {
        jest.clearAllMocks()

        mockGetRouteToQueueFlow.mockReturnValue({
            first_step_id: 'test-basic-flow',
            steps: {},
        })
        mockGetDefaultIvrFlow.mockReturnValue({
            first_step_id: 'test-ivr-flow',
            steps: {},
        })
        mockGetSendToVoicemailFlow.mockReturnValue({
            first_step_id: 'test-voicemail-flow',
            steps: {},
        })

        useFormContextMock.mockReturnValue({
            watch: mockWatch,
            setValue: mockSetValue,
        } as any)

        mockWatch.mockReturnValue([123])
    })

    const renderComponent = () => render(<RoutingTemplateRadioFieldSet />)

    it('should render all routing template options', () => {
        renderComponent()

        expect(
            screen.getByRole('radio', { name: /Basic routing/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /Send all calls to voicemail/i }),
        ).toBeInTheDocument()
        expect(screen.getByRole('radio', { name: /IVR/i })).toBeInTheDocument()
    })

    it('should render captions for each option', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Route calls to a queue inside business hours and to voicemail outside business hours.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Route all incoming calls directly to voicemail.'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Add an IVR menu (e.g. press 1, press 2) to route callers to the right place.',
            ),
        ).toBeInTheDocument()
    })

    it('should select basic routing by default', () => {
        renderComponent()

        expect(
            screen.getByRole('radio', { name: /Basic routing/i }),
        ).toBeChecked()
    })

    it('should set basic routing flow when basic template is selected by default', () => {
        renderComponent()

        expect(mockGetRouteToQueueFlow).toHaveBeenCalledWith(123)
        expect(mockSetValue).toHaveBeenCalledWith('meta.flow', {
            first_step_id: 'test-basic-flow',
            steps: {},
        })
        expect(mockSetValue).toHaveBeenCalledWith(
            'meta.send_calls_to_voicemail',
            false,
        )
    })

    it('should update flow when voicemail template is selected', async () => {
        renderComponent()

        const voicemailRadio = screen.getByRole('radio', {
            name: /Send all calls to voicemail/i,
        })

        await act(() => userEvent.click(voicemailRadio))

        await waitFor(() => {
            expect(mockGetSendToVoicemailFlow).toHaveBeenCalled()
            expect(mockSetValue).toHaveBeenCalledWith('meta.flow', {
                first_step_id: 'test-voicemail-flow',
                steps: {},
            })
            expect(mockSetValue).toHaveBeenCalledWith(
                'meta.send_calls_to_voicemail',
                true,
            )
        })
    })

    it('should update flow when IVR template is selected', async () => {
        renderComponent()

        const ivrRadio = screen.getByRole('radio', { name: /IVR/i })

        await act(() => userEvent.click(ivrRadio))

        await waitFor(() => {
            expect(mockGetDefaultIvrFlow).toHaveBeenCalled()
            expect(mockSetValue).toHaveBeenCalledWith('meta.flow', {
                first_step_id: 'test-ivr-flow',
                steps: {},
            })
            expect(mockSetValue).toHaveBeenCalledWith(
                'meta.send_calls_to_voicemail',
                true,
            )
        })
    })

    it('should show queue select field in basic routing body', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Route calls to a queue inside business hours and to voicemail outside business hours.',
            ),
        ).toBeInTheDocument()
    })

    it('should update flow when queue_id changes', async () => {
        const { rerender } = renderComponent()

        mockWatch.mockReturnValue([456])

        rerender(<RoutingTemplateRadioFieldSet />)

        await waitFor(() => {
            expect(mockGetRouteToQueueFlow).toHaveBeenCalledWith(456)
        })
    })
})
