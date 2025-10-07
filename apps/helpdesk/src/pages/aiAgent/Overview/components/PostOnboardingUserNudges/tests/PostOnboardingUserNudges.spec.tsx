import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { act } from 'react-dom/test-utils'
import { MemoryRouter, Route, Router, Switch } from 'react-router-dom'

import { usePostOnboardingNudges } from '../../../hooks/usePostOnboardingNudges'
import { PostOnboardingUserNudges } from '../PostOnboardingUserNudges'

jest.mock('../../../hooks/usePostOnboardingNudges')

const mockUsePostOnboardingNudges =
    usePostOnboardingNudges as jest.MockedFunction<
        typeof usePostOnboardingNudges
    >

describe('PostOnboardingUserNudges', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            dismissTrainNudge: jest.fn().mockResolvedValue(undefined),
            dismissDeployNudge: jest.fn().mockResolvedValue(undefined),
            isLoading: false,
        })
    })

    const renderComponent = (path = '/app/ai-agent/shopify/test-shop') => {
        return render(
            <MemoryRouter initialEntries={[path]}>
                <Switch>
                    <Route path="/app/ai-agent/:shopType/:shopName">
                        <PostOnboardingUserNudges />
                    </Route>
                </Switch>
            </MemoryRouter>,
        )
    }

    it('should call usePostOnboardingNudges with correct shop params from URL', () => {
        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            dismissTrainNudge: jest.fn(),
            dismissDeployNudge: jest.fn(),
            isLoading: false,
        })

        renderComponent('/app/ai-agent/shopify/test-shop')

        expect(mockUsePostOnboardingNudges).toHaveBeenCalledWith(
            'test-shop',
            'shopify',
        )
    })

    it('should not render anything when loading', () => {
        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            dismissTrainNudge: jest.fn(),
            dismissDeployNudge: jest.fn(),
            isLoading: true,
        })

        const { container } = renderComponent()
        expect(container).toBeEmptyDOMElement()
    })

    it('should not render anything when no nudges should be displayed', () => {
        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            dismissTrainNudge: jest.fn(),
            dismissDeployNudge: jest.fn(),
            isLoading: false,
        })

        const { container } = renderComponent()
        expect(container).toBeEmptyDOMElement()
    })

    it('should render train nudge when shouldDisplayTrainNudge is true', async () => {
        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: true,
            shouldDisplayDeployNudge: false,
            dismissTrainNudge: jest.fn().mockResolvedValue(undefined),
            dismissDeployNudge: jest.fn().mockResolvedValue(undefined),
            isLoading: false,
        })

        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('Your AI Agent is getting smarter'),
            ).toBeInTheDocument()
        })
        expect(screen.getByText('Keep adding knowledge')).toBeInTheDocument()
        expect(screen.getByText('Maybe later')).toBeInTheDocument()
        expect(
            screen.getByAltText('Your AI Agent is getting smarter'),
        ).toBeInTheDocument()
    })

    it('should render deploy nudge when shouldDisplayDeployNudge is true', async () => {
        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: true,
            dismissTrainNudge: jest.fn().mockResolvedValue(undefined),
            dismissDeployNudge: jest.fn().mockResolvedValue(undefined),
            isLoading: false,
        })

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText("You're almost there!")).toBeInTheDocument()
        })
        expect(screen.getByText('Deploy AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Maybe later')).toBeInTheDocument()
        expect(screen.getByAltText("You're almost there!")).toBeInTheDocument()
    })

    it('should render train nudge when both flags are true (train takes precedence)', async () => {
        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: true,
            shouldDisplayDeployNudge: true,
            dismissTrainNudge: jest.fn().mockResolvedValue(undefined),
            dismissDeployNudge: jest.fn().mockResolvedValue(undefined),
            isLoading: false,
        })

        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('Your AI Agent is getting smarter'),
            ).toBeInTheDocument()
        })
        expect(screen.getByText('Keep adding knowledge')).toBeInTheDocument()
    })

    it('should call dismissTrainNudge when dismiss button is clicked on train nudge', async () => {
        const userEvent = user.setup()
        const dismissTrainNudge = jest.fn().mockResolvedValue(undefined)

        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: true,
            shouldDisplayDeployNudge: false,
            dismissTrainNudge,
            dismissDeployNudge: jest.fn().mockResolvedValue(undefined),
            isLoading: false,
        })

        renderComponent()

        const dismissButton = await screen.findByText('Maybe later')
        await userEvent.click(dismissButton)

        await waitFor(() => {
            expect(dismissTrainNudge).toHaveBeenCalledTimes(1)
        })
    })

    it('should call dismissDeployNudge when dismiss button is clicked on deploy nudge', async () => {
        const userEvent = user.setup()
        const dismissDeployNudge = jest.fn().mockResolvedValue(undefined)

        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: true,
            dismissTrainNudge: jest.fn().mockResolvedValue(undefined),
            dismissDeployNudge,
            isLoading: false,
        })

        renderComponent()

        const dismissButton = await screen.findByText('Maybe later')
        await userEvent.click(dismissButton)

        await waitFor(() => {
            expect(dismissDeployNudge).toHaveBeenCalledTimes(1)
        })
    })

    it('should react to location changes and update shop params', async () => {
        const history = createMemoryHistory()
        history.push('/app/ai-agent/shopify/test-shop')

        mockUsePostOnboardingNudges.mockReturnValue({
            shouldDisplayTrainNudge: false,
            shouldDisplayDeployNudge: false,
            dismissTrainNudge: jest.fn(),
            dismissDeployNudge: jest.fn(),
            isLoading: false,
        })

        render(
            <Router history={history}>
                <Switch>
                    <Route path="/app/ai-agent/:shopType/:shopName">
                        <PostOnboardingUserNudges />
                    </Route>
                </Switch>
            </Router>,
        )

        expect(mockUsePostOnboardingNudges).toHaveBeenCalledWith(
            'test-shop',
            'shopify',
        )

        mockUsePostOnboardingNudges.mockClear()

        act(() => {
            history.push('/app/ai-agent/woocommerce/other-shop')
        })

        await waitFor(() => {
            expect(mockUsePostOnboardingNudges).toHaveBeenCalledWith(
                'other-shop',
                'woocommerce',
            )
        })
    })
})
