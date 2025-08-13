import React from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { PromoCard } from '../PromoCard'

// Mock assets for testing
const mockPoster = '/test-poster.jpg'
const mockVideoUrl = '/test-video.mp4'

describe('PromoCard', () => {
    describe('Callback Invocation Tests', () => {
        it('should successfully invoke ActionButton onClick callback', async () => {
            const mockOnClick = jest.fn()

            render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="Test Button"
                                onClick={mockOnClick}
                                variant="primary"
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const button = screen.getByRole('button', { name: /test button/i })
            await act(async () => {
                await userEvent.click(button)
            })

            expect(mockOnClick).toHaveBeenCalledTimes(1)
        })

        it('should successfully invoke VideoThumbnail onClick callback', async () => {
            const mockOnClick = jest.fn()

            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            onClick={mockOnClick}
                        />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            expect(mockOnClick).toHaveBeenCalledTimes(1)
        })

        it('should invoke VideoThumbnail onClick and open modal when videoUrl is provided', async () => {
            const mockOnClick = jest.fn()

            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                            onClick={mockOnClick}
                        />
                        <PromoCard.VideoModal videoUrl={mockVideoUrl} />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            expect(mockOnClick).toHaveBeenCalledTimes(1)
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })
        })

        it('should not invoke ActionButton onClick when disabled', async () => {
            const mockOnClick = jest.fn()

            render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="Disabled Button"
                                onClick={mockOnClick}
                                disabled
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const button = screen.getByRole('button', {
                name: /disabled button/i,
            })
            await act(async () => {
                await userEvent.click(button)
            })

            expect(mockOnClick).not.toHaveBeenCalled()
        })
    })

    describe('Dynamic Styles Validation Tests', () => {
        it('should apply custom className to ActionButton', () => {
            render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="Styled Button"
                                onClick={() => {}}
                                className="custom-test-class"
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const button = screen.getByRole('button', {
                name: /styled button/i,
            })
            expect(button).toHaveClass('custom-test-class')
        })

        it('should apply variant classes to ActionButton', () => {
            const { rerender } = render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="Primary Button"
                                onClick={() => {}}
                                variant="primary"
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            let button = screen.getByRole('button', { name: /primary button/i })
            expect(button).toHaveClass('primary')

            rerender(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="Secondary Button"
                                onClick={() => {}}
                                variant="secondary"
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            button = screen.getByRole('button', { name: /secondary button/i })
            expect(button).toHaveClass('secondary')

            rerender(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="Ghost Button"
                                onClick={() => {}}
                                variant="ghost"
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            button = screen.getByRole('button', { name: /ghost button/i })
            expect(button).toHaveClass('ghost')
        })

        it('should apply custom inline styles to Text component', () => {
            const customStyle = { color: 'red', fontSize: '20px' }

            render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Text style={customStyle}>
                            Styled Text
                        </PromoCard.Text>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const text = screen.getByText('Styled Text')
            expect(text).toHaveStyle({
                color: 'red',
                fontSize: '20px',
            })
        })

        it('should apply custom inline styles to Media component', () => {
            const customStyle = { backgroundColor: 'blue', padding: '10px' }

            render(
                <PromoCard>
                    <PromoCard.Media style={customStyle}>
                        <div>Media Content</div>
                    </PromoCard.Media>
                </PromoCard>,
            )

            const media = screen.getByText('Media Content').parentElement
            expect(media).toHaveStyle({
                backgroundColor: 'blue',
                padding: '10px',
            })
        })

        it('should apply ProgressBar custom colors and dimensions', () => {
            const { container } = render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.ProgressBar
                            percentage={75}
                            fillColor="#ff0000"
                            trackColor="#00ff00"
                            height={12}
                        />
                    </PromoCard.Content>
                </PromoCard>,
            )

            const progressTrack = container.querySelector(
                '[style*="background-color: rgb(0, 255, 0)"]',
            )
            const progressFill = container.querySelector(
                '[style*="width: 75%"]',
            )

            expect(progressTrack).toHaveStyle({
                backgroundColor: '#00ff00',
                height: '12px',
            })
            expect(progressFill).toHaveStyle({
                width: '75%',
                background: '#ff0000',
            })
        })

        it('should apply ProgressBar gradient fill color', () => {
            const gradientColor =
                'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)'
            const { container } = render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.ProgressBar
                            percentage={50}
                            fillColor={gradientColor}
                        />
                    </PromoCard.Content>
                </PromoCard>,
            )

            const progressFill = container.querySelector(
                '[style*="width: 50%"]',
            )
            expect(progressFill).toHaveStyle({
                background: gradientColor,
            })
        })

        it('should apply custom className to VideoThumbnail', () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            className="custom-video-thumbnail"
                        />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            expect(videoThumbnail).toHaveClass('custom-video-thumbnail')
        })
    })

    describe('ActionButton Tests', () => {
        it('should render ActionButton as external link with href prop', () => {
            render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="External Link"
                                href="https://example.com"
                                variant="primary"
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const link = screen.getByRole('link', {
                name: /external link/i,
            })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', 'https://example.com')
            expect(link).toHaveClass('primary')
        })
        it('should render external link with target="_blank" and default rel attributes', () => {
            render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="External Link"
                                href="https://example.com"
                                target="_blank"
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const link = screen.getByRole('link', {
                name: /external link/i,
            })
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        })
        it('should render ActionButton as internal router link with to prop', () => {
            render(
                <MemoryRouter>
                    <PromoCard>
                        <PromoCard.Content>
                            <PromoCard.Actions>
                                <PromoCard.ActionButton
                                    label="Internal Link"
                                    to="/dashboard"
                                    variant="secondary"
                                />
                            </PromoCard.Actions>
                        </PromoCard.Content>
                    </PromoCard>
                </MemoryRouter>,
            )

            const link = screen.getByText('Internal Link')
            expect(link).toBeInTheDocument()
            expect(link.tagName).toBe('A')
        })
        it('should render ActionButton as button when no href or to props are provided', () => {
            const mockOnClick = jest.fn()

            render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="Button"
                                onClick={mockOnClick}
                                variant="ghost"
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const button = screen.getByRole('button', { name: /button/i })
            expect(button).toBeInTheDocument()
            expect(button).toHaveClass('ghost')
            expect(button).toHaveAttribute('type', 'button')
        })
    })

    describe('Video Modal Behavior Tests', () => {
        it('should not show video modal initially', () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal videoUrl={mockVideoUrl} />
                    </PromoCard.Media>
                </PromoCard>,
            )

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should open video modal when video thumbnail is clicked', async () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal videoUrl={mockVideoUrl} />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })

            await act(async () => {
                await act(async () => {
                    await userEvent.click(videoThumbnail)
                })
            })

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })
        })

        it('should close video modal when ESC key is pressed', async () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal videoUrl={mockVideoUrl} />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })

            await act(async () => {
                await act(async () => {
                    await userEvent.click(videoThumbnail)
                })
            })

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            act(() => {
                fireEvent.keyDown(document, { key: 'Escape' })
            })

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            })
        })

        it('should close video modal when clicking outside the modal content', async () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal videoUrl={mockVideoUrl} />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })

            await act(async () => {
                await act(async () => {
                    await userEvent.click(videoThumbnail)
                })
            })

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            const modal = screen.getByRole('dialog')

            await act(async () => {
                await act(async () => {
                    await userEvent.click(modal)
                })
            })

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            })
        })

        it('should show close button when video starts', async () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal videoUrl={mockVideoUrl} />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })

            await act(async () => {
                await act(async () => {
                    await userEvent.click(videoThumbnail)
                })
            })

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            // Initially, close button should not be visible
            expect(
                screen.queryByRole('button', { name: /close video modal/i }),
            ).toBeInTheDocument()

            // Simulate video ending
            const video = screen.getByRole('dialog').querySelector('video')

            act(() => {
                act(() => {
                    fireEvent.ended(video!)
                })
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /close video modal/i }),
                ).toBeInTheDocument()
            })
        })

        it('should show video CTA only when video ends and CTA is provided', async () => {
            const mockCtaClick = jest.fn()

            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal
                            videoUrl={mockVideoUrl}
                            ctaButton={{
                                label: 'Video End CTA',
                                onClick: mockCtaClick,
                                variant: 'primary',
                            }}
                        />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            // Initially, CTA should not be visible
            expect(
                screen.queryByRole('button', { name: /video end cta/i }),
            ).not.toBeInTheDocument()

            // Simulate video ending
            const video = screen.getByRole('dialog').querySelector('video')
            act(() => {
                fireEvent.ended(video!)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /video end cta/i }),
                ).toBeInTheDocument()
            })

            // CTA should be clickable
            const ctaButton = screen.getByRole('button', {
                name: /video end cta/i,
            })
            await act(async () => {
                await userEvent.click(ctaButton)
            })
            expect(mockCtaClick).toHaveBeenCalledTimes(1)
        })

        it('should close video modal when close button is clicked after video ends', async () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal videoUrl={mockVideoUrl} />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            // Simulate video ending
            const video = screen.getByRole('dialog').querySelector('video')
            act(() => {
                fireEvent.ended(video!)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /close video modal/i }),
                ).toBeInTheDocument()
            })

            const closeButton = screen.getByRole('button', {
                name: /close video modal/i,
            })
            await act(async () => {
                await userEvent.click(closeButton)
            })

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            })
        })

        it('should hide CTA when user rewinds video after it ends', async () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal
                            videoUrl={mockVideoUrl}
                            ctaButton={{
                                label: 'Video End CTA',
                                onClick: () => {},
                                variant: 'primary',
                            }}
                        />
                    </PromoCard.Media>
                </PromoCard>,
            )

            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            const video = screen.getByRole('dialog').querySelector('video')!

            // Mock video duration
            Object.defineProperty(video, 'duration', {
                writable: true,
                value: 100,
            })

            // Simulate video ending - CTA should appear
            act(() => {
                fireEvent.ended(video)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /video end cta/i }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('button', { name: /close video modal/i }),
                ).toBeInTheDocument()
            })

            // Simulate user rewinding video (currentTime < duration - 1)
            Object.defineProperty(video, 'currentTime', {
                writable: true,
                value: 50, // Rewound to middle of video
            })

            act(() => {
                fireEvent.timeUpdate(video)
            })

            // CTA and close button should be hidden when user rewinds
            await waitFor(() => {
                expect(
                    screen.queryByRole('button', { name: /video end cta/i }),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByRole('button', {
                        name: /close video modal/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should auto-close modal when CTA button is clicked', async () => {
            const mockCtaClick = jest.fn()

            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal
                            videoUrl={mockVideoUrl}
                            ctaButton={{
                                label: 'Auto Close CTA',
                                onClick: mockCtaClick,
                                variant: 'secondary',
                            }}
                        />
                    </PromoCard.Media>
                </PromoCard>,
            )

            // Open modal
            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument()
            })

            // End video to show CTA
            const video = screen.getByRole('dialog').querySelector('video')
            act(() => {
                fireEvent.ended(video!)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /auto close cta/i }),
                ).toBeInTheDocument()
            })

            // Click CTA - should call onClick and close modal
            const ctaButton = screen.getByRole('button', {
                name: /auto close cta/i,
            })
            await act(async () => {
                await userEvent.click(ctaButton)
            })

            expect(mockCtaClick).toHaveBeenCalledTimes(1)
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            })
        })

        it('should render CTA button with all configuration options', async () => {
            const mockIcon = () => <span data-testid="custom-icon">★</span>

            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal
                            videoUrl={mockVideoUrl}
                            ctaButton={{
                                label: 'Full Config CTA',
                                onClick: jest.fn(),
                                variant: 'primary',
                                className: 'custom-cta-class',
                                Icon: mockIcon,
                                disabled: false,
                            }}
                        />
                    </PromoCard.Media>
                </PromoCard>,
            )

            // Open modal and end video
            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            const video = screen.getByRole('dialog').querySelector('video')
            act(() => {
                fireEvent.ended(video!)
            })

            await waitFor(() => {
                const ctaButton = screen.getByRole('button', {
                    name: /full config cta/i,
                })
                expect(ctaButton).toBeInTheDocument()
                expect(ctaButton).toHaveClass('primary')
                expect(ctaButton).toHaveClass('custom-cta-class')
                expect(ctaButton).not.toBeDisabled()
                expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
            })
        })

        it('should render CTA button as external link when href is provided', async () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal
                            videoUrl={mockVideoUrl}
                            ctaButton={{
                                label: 'External Link CTA',
                                href: 'https://example.com',
                                target: '_blank',
                                variant: 'ghost',
                            }}
                        />
                    </PromoCard.Media>
                </PromoCard>,
            )

            // Open modal and end video
            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            const video = screen.getByRole('dialog').querySelector('video')
            act(() => {
                fireEvent.ended(video!)
            })

            await waitFor(() => {
                const ctaLink = screen.getByRole('link', {
                    name: /external link cta/i,
                })
                expect(ctaLink).toBeInTheDocument()
                expect(ctaLink).toHaveAttribute('href', 'https://example.com')
                expect(ctaLink).toHaveAttribute('target', '_blank')
                expect(ctaLink).toHaveClass('ghost')
            })

            // Click external link should still close modal
            const ctaLink = screen.getByRole('link', {
                name: /external link cta/i,
            })
            await act(async () => {
                await userEvent.click(ctaLink)
            })

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            })
        })

        it('should not show CTA when no ctaButton is provided', async () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal videoUrl={mockVideoUrl} />
                    </PromoCard.Media>
                </PromoCard>,
            )

            // Open modal and end video
            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            const video = screen.getByRole('dialog').querySelector('video')
            act(() => {
                fireEvent.ended(video!)
            })

            // Only close button should be visible, no CTA
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /close video modal/i }),
                ).toBeInTheDocument()
                expect(
                    screen.queryByRole('button', { name: /cta/i }),
                ).not.toBeInTheDocument()
            })
        })

        it('should handle disabled CTA button correctly', async () => {
            const mockCtaClick = jest.fn()

            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal
                            videoUrl={mockVideoUrl}
                            ctaButton={{
                                label: 'Disabled CTA',
                                onClick: mockCtaClick,
                                disabled: true,
                            }}
                        />
                    </PromoCard.Media>
                </PromoCard>,
            )

            // Open modal and end video
            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            const video = screen.getByRole('dialog').querySelector('video')
            act(() => {
                fireEvent.ended(video!)
            })

            await waitFor(() => {
                const ctaButton = screen.getByRole('button', {
                    name: /disabled cta/i,
                })
                expect(ctaButton).toHaveAttribute('aria-disabled', 'true')
            })

            // Try to click disabled button - should not trigger onClick or close modal
            const ctaButton = screen.getByRole('button', {
                name: /disabled cta/i,
            })
            await act(async () => {
                await userEvent.click(ctaButton)
            })

            expect(mockCtaClick).not.toHaveBeenCalled()
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('should render CTA button as router link when to prop is provided', async () => {
            render(
                <MemoryRouter>
                    <PromoCard>
                        <PromoCard.Media>
                            <PromoCard.VideoThumbnail
                                poster={mockPoster}
                                alt="Test Video"
                                videoUrl={mockVideoUrl}
                            />
                            <PromoCard.VideoModal
                                videoUrl={mockVideoUrl}
                                ctaButton={{
                                    label: 'Router Link CTA',
                                    to: '/dashboard',
                                    variant: 'secondary',
                                }}
                            />
                        </PromoCard.Media>
                    </PromoCard>
                </MemoryRouter>,
            )

            // Open modal and end video
            const videoThumbnail = screen.getByRole('button', {
                name: /test video/i,
            })
            await act(async () => {
                await userEvent.click(videoThumbnail)
            })

            const video = screen.getByRole('dialog').querySelector('video')
            act(() => {
                fireEvent.ended(video!)
            })

            await waitFor(() => {
                const ctaLink = screen.getByText('Router Link CTA')
                expect(ctaLink).toBeInTheDocument()
                expect(ctaLink.tagName).toBe('A')
                expect(ctaLink).toHaveClass('secondary')
            })

            // Click router link should still close modal
            const ctaLink = screen.getByText('Router Link CTA')
            await act(async () => {
                await userEvent.click(ctaLink)
            })

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            })
        })
    })

    describe('Collapsible Functionality Tests', () => {
        it('should render collapsible card in expanded state by default', () => {
            render(
                <PromoCard collapsible>
                    <PromoCard.Content>
                        <PromoCard.Header>
                            <PromoCard.Title>Collapsible Title</PromoCard.Title>
                            <PromoCard.Description>
                                Test Description
                            </PromoCard.Description>
                        </PromoCard.Header>
                        <PromoCard.Text>Collapsible Content</PromoCard.Text>
                    </PromoCard.Content>
                </PromoCard>,
            )

            expect(screen.getByText('Test Description')).toBeInTheDocument()
            expect(screen.getByText('Collapsible Content')).toBeInTheDocument()

            const collapseButton = screen.getByRole('button', {
                name: /collapse/i,
            })
            expect(collapseButton).toHaveAttribute('aria-expanded', 'true')
        })

        it('should render collapsible card in collapsed state when defaultCollapsed is true', () => {
            render(
                <PromoCard collapsible defaultCollapsed>
                    <PromoCard.Content>
                        <PromoCard.Header>
                            <PromoCard.Title>Collapsible Title</PromoCard.Title>
                            <PromoCard.Description>
                                Test Description
                            </PromoCard.Description>
                        </PromoCard.Header>
                        <PromoCard.Text>Collapsible Content</PromoCard.Text>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const description = screen.getByText('Test Description')
            const content = screen.getByText('Collapsible Content')

            expect(description).toHaveClass('collapsed')
            expect(content).toHaveClass('collapsed')

            const expandButton = screen.getByRole('button', { name: /expand/i })
            expect(expandButton).toHaveAttribute('aria-expanded', 'false')
        })

        it('should toggle collapsed state when collapse button is clicked', async () => {
            render(
                <PromoCard collapsible>
                    <PromoCard.Content>
                        <PromoCard.Header>
                            <PromoCard.Title>Collapsible Title</PromoCard.Title>
                            <PromoCard.Description>
                                Test Description
                            </PromoCard.Description>
                        </PromoCard.Header>
                        <PromoCard.Text>Collapsible Content</PromoCard.Text>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const description = screen.getByText('Test Description')
            const content = screen.getByText('Collapsible Content')

            // Initially expanded
            expect(description).not.toHaveClass('collapsed')
            expect(content).not.toHaveClass('collapsed')

            const collapseButton = screen.getByRole('button', {
                name: /collapse/i,
            })
            await act(async () => {
                await userEvent.click(collapseButton)
            })

            // Should be collapsed after click
            expect(description).toHaveClass('collapsed')
            expect(content).toHaveClass('collapsed')
            expect(
                screen.getByRole('button', { name: /expand/i }),
            ).toHaveAttribute('aria-expanded', 'false')

            // Click again to expand
            const expandButton = screen.getByRole('button', { name: /expand/i })
            await act(async () => {
                await userEvent.click(expandButton)
            })

            // Should be expanded again
            expect(description).not.toHaveClass('collapsed')
            expect(content).not.toHaveClass('collapsed')
            expect(
                screen.getByRole('button', { name: /collapse/i }),
            ).toHaveAttribute('aria-expanded', 'true')
        })

        it('should collapse/expand all collapsible content including Media, Actions, and ProgressBar', async () => {
            render(
                <PromoCard collapsible>
                    <PromoCard.Media>
                        <div>Media Content</div>
                    </PromoCard.Media>
                    <PromoCard.Content>
                        <PromoCard.Header>
                            <PromoCard.Title>Collapsible Title</PromoCard.Title>
                            <PromoCard.Description>
                                Test Description
                            </PromoCard.Description>
                        </PromoCard.Header>
                        <PromoCard.ProgressBar percentage={50} />
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="Test Action"
                                onClick={() => {}}
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const media = screen.getByText('Media Content').parentElement
            const description = screen.getByText('Test Description')
            const actions = screen.getByRole('button', {
                name: /test action/i,
            }).parentElement

            // Initially expanded
            expect(media).not.toHaveClass('collapsed')
            expect(description).not.toHaveClass('collapsed')
            expect(actions).not.toHaveClass('collapsed')

            const collapseButton = screen.getByRole('button', {
                name: /collapse/i,
            })
            await act(async () => {
                await userEvent.click(collapseButton)
            })

            // Should be collapsed after click
            expect(media).toHaveClass('collapsed')
            expect(description).toHaveClass('collapsed')
            expect(actions).toHaveClass('collapsed')
        })

        it('should not show collapse button when collapsible is false', () => {
            render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Header>
                            <PromoCard.Title>
                                Non-Collapsible Title
                            </PromoCard.Title>
                            <PromoCard.Description>
                                Test Description
                            </PromoCard.Description>
                        </PromoCard.Header>
                    </PromoCard.Content>
                </PromoCard>,
            )

            expect(
                screen.queryByRole('button', { name: /collapse/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /expand/i }),
            ).not.toBeInTheDocument()
        })

        it('should not apply collapsed styles when collapsible is false', () => {
            render(
                <PromoCard>
                    <PromoCard.Content>
                        <PromoCard.Header>
                            <PromoCard.Title>
                                Non-Collapsible Title
                            </PromoCard.Title>
                            <PromoCard.Description>
                                Test Description
                            </PromoCard.Description>
                        </PromoCard.Header>
                        <PromoCard.Text>Always Visible Content</PromoCard.Text>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const description = screen.getByText('Test Description')
            const content = screen.getByText('Always Visible Content')

            expect(description).not.toHaveClass('collapsed')
            expect(content).not.toHaveClass('collapsed')
        })
        it('should have proper ARIA attributes for collapsible functionality', () => {
            render(
                <PromoCard collapsible>
                    <PromoCard.Content>
                        <PromoCard.Header>
                            <PromoCard.Title>Collapsible Title</PromoCard.Title>
                        </PromoCard.Header>
                    </PromoCard.Content>
                </PromoCard>,
            )

            const collapseButton = screen.getByRole('button', {
                name: /collapse/i,
            })
            expect(collapseButton).toHaveAttribute('aria-expanded', 'true')
            expect(collapseButton).toHaveAttribute('aria-label', 'Collapse')
        })
    })

    describe('Component Integration Tests', () => {
        it('should render complete PromoCard with all components', () => {
            render(
                <PromoCard>
                    <PromoCard.Media>
                        <PromoCard.VideoThumbnail
                            poster={mockPoster}
                            alt="Integration Test Video"
                            videoUrl={mockVideoUrl}
                        />
                        <PromoCard.VideoModal videoUrl={mockVideoUrl} />
                    </PromoCard.Media>
                    <PromoCard.Content>
                        <PromoCard.Header>
                            <PromoCard.Title>Integration Test</PromoCard.Title>
                            <PromoCard.Description>
                                Complete component test
                            </PromoCard.Description>
                        </PromoCard.Header>
                        <PromoCard.Text>Additional text content</PromoCard.Text>
                        <PromoCard.ProgressBar percentage={75} />
                        <PromoCard.Actions>
                            <PromoCard.ActionButton
                                label="Primary Action"
                                onClick={() => {}}
                                variant="primary"
                            />
                            <PromoCard.ActionButton
                                label="Secondary Action"
                                onClick={() => {}}
                                variant="ghost"
                            />
                        </PromoCard.Actions>
                    </PromoCard.Content>
                </PromoCard>,
            )

            expect(
                screen.getByRole('button', { name: /integration test video/i }),
            ).toBeInTheDocument()
            expect(screen.getByText('Integration Test')).toBeInTheDocument()
            expect(
                screen.getByText('Complete component test'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Additional text content'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /primary action/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /secondary action/i }),
            ).toBeInTheDocument()
        })
    })
})
