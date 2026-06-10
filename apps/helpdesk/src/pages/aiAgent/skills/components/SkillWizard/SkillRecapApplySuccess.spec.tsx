import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Switch, useLocation } from 'react-router-dom'

import { ThemeProvider } from 'core/theme'

import doneAnimation from 'assets/img/ai-agent/skill_wizrad_done.json'

import { SkillRecapApplySuccess } from './SkillRecapApplySuccess'

jest.mock('lottie-react', () => ({
    __esModule: true,
    default: jest.fn(({ animationData, ...props }) => (
        <div
            data-testid="lottie-animation"
            data-animation-data={JSON.stringify(animationData)}
            {...props}
        />
    )),
}))

const SHOP_NAME = 'ekster'
const SUCCESS_PATH = `/app/ai-agent/shopify/${SHOP_NAME}/skills/wizard/success`
const SKILLS_PATH = `/app/ai-agent/shopify/${SHOP_NAME}/skills`

const PathProbe = () => {
    const location = useLocation()
    return <p>path: {location.pathname}</p>
}

const renderSuccess = ({ liveSkillsCount }: { liveSkillsCount: number }) =>
    render(
        <ThemeProvider>
            <MemoryRouter initialEntries={[SUCCESS_PATH]}>
                <Switch>
                    <Route path="/app/ai-agent/shopify/:shopName/skills/wizard/success">
                        <SkillRecapApplySuccess
                            liveSkillsCount={liveSkillsCount}
                        />
                    </Route>
                    <Route
                        path="/app/ai-agent/shopify/:shopName/skills"
                        render={() => <p>Skills landing</p>}
                    />
                </Switch>
                <PathProbe />
            </MemoryRouter>
        </ThemeProvider>,
    )

describe('SkillRecapApplySuccess', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('uses singular copy when exactly one skill is live', () => {
        renderSuccess({ liveSkillsCount: 1 })

        expect(
            screen.getByRole('heading', { name: '1 skill is live' }),
        ).toBeInTheDocument()
    })

    it('uses plural copy when more than one skill is live', () => {
        renderSuccess({ liveSkillsCount: 9 })

        expect(
            screen.getByRole('heading', { name: '9 skills are live' }),
        ).toBeInTheDocument()
    })

    it('uses plural copy when zero skills are live', () => {
        renderSuccess({ liveSkillsCount: 0 })

        expect(
            screen.getByRole('heading', { name: '0 skills are live' }),
        ).toBeInTheDocument()
    })

    it('redirects to the skills landing after the display delay elapses', async () => {
        renderSuccess({ liveSkillsCount: 2 })

        expect(screen.getByText(`path: ${SUCCESS_PATH}`)).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.getByText(`path: ${SKILLS_PATH}`)).toBeInTheDocument()
        })
        expect(screen.getByText('Skills landing')).toBeInTheDocument()
    })

    it('does not redirect before the display delay elapses', () => {
        renderSuccess({ liveSkillsCount: 2 })

        act(() => {
            jest.advanceTimersByTime(2999)
        })

        expect(screen.getByText(`path: ${SUCCESS_PATH}`)).toBeInTheDocument()
        expect(screen.queryByText('Skills landing')).not.toBeInTheDocument()
    })

    it('does not navigate after unmount even if the timers complete', () => {
        const { unmount } = renderSuccess({ liveSkillsCount: 2 })

        unmount()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        // Outer Switch is unmounted so neither route content remains
        expect(screen.queryByText('Skills landing')).not.toBeInTheDocument()
    })

    it('renders the done animation hidden from assistive technology', () => {
        renderSuccess({ liveSkillsCount: 1 })

        const animation = screen.getByTestId('lottie-animation')

        expect(animation).toBeInTheDocument()
        expect(animation).toHaveAttribute('aria-hidden', 'true')
        expect(animation).toHaveAttribute(
            'data-animation-data',
            JSON.stringify(doneAnimation),
        )
    })
})
