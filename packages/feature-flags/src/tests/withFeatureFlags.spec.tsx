import React from 'react'

import { render, screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { vi } from 'vitest'

import { withFeatureFlags } from '../withFeatureFlags'

vi.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: vi.fn(),
}))

describe('withFeatureFlags', () => {
    const mockFlags = {
        featureFlag1: true,
        featureFlag2: false,
        featureFlag3: 'variant-a',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render the wrapped component', () => {
        const MockComponent = () => <div>Test Component</div>
        const WrappedComponent = withFeatureFlags(MockComponent)

        vi.mocked(useFlags).mockReturnValue(mockFlags)

        render(<WrappedComponent />)

        expect(screen.getByText('Test Component')).toBeInTheDocument()
    })

    it('should pass feature flags to the wrapped component', () => {
        interface TestProps {
            flags?: Record<string, any>
        }

        const MockComponent = ({ flags }: TestProps) => (
            <div>
                <span>Flag 1: {String(flags?.featureFlag1)}</span>
                <span>Flag 2: {String(flags?.featureFlag2)}</span>
                <span>Flag 3: {flags?.featureFlag3}</span>
            </div>
        )

        const WrappedComponent = withFeatureFlags(MockComponent)

        vi.mocked(useFlags).mockReturnValue(mockFlags)

        render(<WrappedComponent />)

        expect(screen.getByText('Flag 1: true')).toBeInTheDocument()
        expect(screen.getByText('Flag 2: false')).toBeInTheDocument()
        expect(screen.getByText('Flag 3: variant-a')).toBeInTheDocument()
    })

    it('should pass original props to the wrapped component', () => {
        interface TestProps {
            testProp: string
            numberProp: number
            flags?: Record<string, any>
        }

        const MockComponent = ({ testProp, numberProp }: TestProps) => (
            <div>
                <span>Test prop: {testProp}</span>
                <span>Number prop: {numberProp}</span>
            </div>
        )

        const WrappedComponent = withFeatureFlags(MockComponent)

        vi.mocked(useFlags).mockReturnValue(mockFlags)

        render(<WrappedComponent testProp="test value" numberProp={42} />)

        expect(screen.getByText('Test prop: test value')).toBeInTheDocument()
        expect(screen.getByText('Number prop: 42')).toBeInTheDocument()
    })

    it('should pass both original props and flags to the wrapped component', () => {
        interface TestProps {
            customProp: string
            flags?: Record<string, any>
        }

        const MockComponent = ({ customProp, flags }: TestProps) => (
            <div>
                <span>Custom: {customProp}</span>
                <span>Has flags: {flags ? 'yes' : 'no'}</span>
                <span>Flag count: {Object.keys(flags || {}).length}</span>
            </div>
        )

        const WrappedComponent = withFeatureFlags(MockComponent)

        vi.mocked(useFlags).mockReturnValue(mockFlags)

        render(<WrappedComponent customProp="custom value" />)

        expect(screen.getByText('Custom: custom value')).toBeInTheDocument()
        expect(screen.getByText('Has flags: yes')).toBeInTheDocument()
        expect(screen.getByText('Flag count: 3')).toBeInTheDocument()
    })

    it('should handle empty flags object', () => {
        interface TestProps {
            flags?: Record<string, any>
        }

        const MockComponent = ({ flags }: TestProps) => (
            <div>
                <span>Has flags: {flags ? 'yes' : 'no'}</span>
                <span>Flag count: {Object.keys(flags || {}).length}</span>
            </div>
        )

        const WrappedComponent = withFeatureFlags(MockComponent)

        vi.mocked(useFlags).mockReturnValue({})

        render(<WrappedComponent />)

        expect(screen.getByText('Has flags: yes')).toBeInTheDocument()
        expect(screen.getByText('Flag count: 0')).toBeInTheDocument()
    })

    it('should handle undefined flags', () => {
        interface TestProps {
            flags?: Record<string, any>
        }

        const MockComponent = ({ flags }: TestProps) => (
            <div>
                <span>Flags value: {String(flags)}</span>
            </div>
        )

        const WrappedComponent = withFeatureFlags(MockComponent)

        vi.mocked(useFlags).mockReturnValue(undefined as any)

        render(<WrappedComponent />)

        expect(screen.getByText('Flags value: undefined')).toBeInTheDocument()
    })

    it('should re-render when flags change', () => {
        interface TestProps {
            flags?: Record<string, any>
        }

        const MockComponent = ({ flags }: TestProps) => (
            <div>Flag 1: {String(flags?.featureFlag1)}</div>
        )

        const WrappedComponent = withFeatureFlags(MockComponent)

        const { rerender } = render(<WrappedComponent />)

        vi.mocked(useFlags).mockReturnValue({ featureFlag1: true })
        rerender(<WrappedComponent />)

        expect(screen.getByText('Flag 1: true')).toBeInTheDocument()

        vi.mocked(useFlags).mockReturnValue({ featureFlag1: false })
        rerender(<WrappedComponent />)

        expect(screen.getByText('Flag 1: false')).toBeInTheDocument()
    })

    it('should preserve component display name', () => {
        const MockComponent = () => <div>Test</div>
        MockComponent.displayName = 'CustomComponentName'

        const WrappedComponent = withFeatureFlags(MockComponent)

        vi.mocked(useFlags).mockReturnValue({})

        render(<WrappedComponent />)

        expect(MockComponent.displayName).toBe('CustomComponentName')
    })

    it('should work with class components', () => {
        interface TestProps {
            flags?: Record<string, any>
            testProp?: string
        }

        class ClassComponent extends React.Component<TestProps> {
            render() {
                return (
                    <div>
                        <span>Class component</span>
                        <span>Test prop: {this.props.testProp}</span>
                        <span>
                            Has flags: {this.props.flags ? 'yes' : 'no'}
                        </span>
                    </div>
                )
            }
        }

        const WrappedComponent = withFeatureFlags(ClassComponent)

        vi.mocked(useFlags).mockReturnValue(mockFlags)

        render(<WrappedComponent testProp="test value" />)

        expect(screen.getByText('Class component')).toBeInTheDocument()
        expect(screen.getByText('Test prop: test value')).toBeInTheDocument()
        expect(screen.getByText('Has flags: yes')).toBeInTheDocument()
    })
})
