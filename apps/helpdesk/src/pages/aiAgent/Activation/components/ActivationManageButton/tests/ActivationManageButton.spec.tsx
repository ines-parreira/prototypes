import React from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { userEvent } from '@repo/testing'

import { ActivationManageButton } from '../ActivationManageButton'

describe('<ActivationManageButton />', () => {
    describe('when hasAiAgentNewActivationXp is false', () => {
        const hasAiAgentNewActivationXp = false

        it.each([
            { progress: 0, text: 'Activate AI Agent' },
            { progress: 50, text: 'Partially activated' },
            { progress: 100, text: 'Fully activated' },
        ])(
            'should render the button with "$text" when progress is $progress',
            ({ progress, text }) => {
                render(
                    <ActivationManageButton
                        hasAiAgentNewActivationXp={hasAiAgentNewActivationXp}
                        onClick={jest.fn()}
                        progress={progress}
                    />,
                )

                expect(screen.getByText(text)).toBeInTheDocument()
                expect(screen.getByText(`${progress}%`)).toBeInTheDocument()
                expect(screen.getByText('Manage')).toBeInTheDocument()
            },
        )

        it('should trigger onClick when click on the button', () => {
            const onClickMock = jest.fn()
            render(
                <ActivationManageButton
                    hasAiAgentNewActivationXp={hasAiAgentNewActivationXp}
                    onClick={onClickMock}
                    progress={100}
                />,
            )

            const button = screen.getByText('Manage')
            userEvent.click(button)

            expect(onClickMock).toHaveBeenCalledTimes(1)
        })
    })

    describe('when hasAiAgentNewActivationXp is true', () => {
        it.each([
            {
                variant: 'bordered' as const,
            },
            { variant: 'flat' as const, status: 'live' as const },
        ])('should trigger onClick when clicking on the %s button', (props) => {
            const onClickMock = jest.fn()
            render(
                <ActivationManageButton
                    onClick={onClickMock}
                    {...props}
                    hasAiAgentNewActivationXp
                />,
            )

            const button = screen.getByText('AI Agent Status')
            userEvent.click(button)

            expect(onClickMock).toHaveBeenCalledTimes(1)
        })

        it('should render bordered button', () => {
            render(
                <ActivationManageButton
                    onClick={jest.fn()}
                    variant="bordered"
                    hasAiAgentNewActivationXp
                />,
            )

            expect(screen.getByText('AI Agent Status')).toBeInTheDocument()
            expect(screen.queryByText('OFF')).not.toBeInTheDocument()
            expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
        })

        it('should render flat button status off', () => {
            render(
                <ActivationManageButton
                    onClick={jest.fn()}
                    variant="flat"
                    status="off"
                    hasAiAgentNewActivationXp
                />,
            )

            expect(screen.getByText('AI Agent Status')).toBeInTheDocument()
            expect(screen.getByText('OFF')).toBeInTheDocument()
        })

        it('should render flat button with status live', () => {
            render(
                <ActivationManageButton
                    onClick={jest.fn()}
                    variant="flat"
                    status="live"
                    hasAiAgentNewActivationXp
                />,
            )

            expect(screen.getByText('AI Agent Status')).toBeInTheDocument()
            expect(screen.getByText('LIVE')).toBeInTheDocument()
        })
    })
})
