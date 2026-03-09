/* eslint-disable no-console */
import React from 'react'

import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import preTrialBannerThumbnail from 'assets/img/pre-trial-banner-thumbnail.png'
import aiAgentPreviewVideo from 'assets/video/ai-agent-sales-video.mp4'

import { PromoCard } from './PromoCard'

export default {
    title: 'Components/PromoCard',
    component: PromoCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} as Meta

export const VideoThumbnailSingleCallToAction: StoryFn = () => (
    <>
        <PromoCard>
            <PromoCard.Media
                style={{
                    background:
                        'linear-gradient(296deg, rgba(210, 155, 255, 0.10) 29.82%, rgba(235, 139, 76, 0.10) 63.34%)',
                }}
            >
                <PromoCard.VideoThumbnail
                    poster={preTrialBannerThumbnail}
                    alt="Shopping Assistant Demo"
                    videoUrl={aiAgentPreviewVideo}
                    className="video-thumbnail"
                />
                <PromoCard.VideoModal videoUrl={aiAgentPreviewVideo} />
            </PromoCard.Media>
            <PromoCard.Content>
                <PromoCard.Header>
                    <PromoCard.Title>Shopping Assistant</PromoCard.Title>
                    <PromoCard.Description>
                        Unlock revenue growth and influence 1.5% in GMV with our
                        AI-powered shopping assistant
                    </PromoCard.Description>
                </PromoCard.Header>
                <PromoCard.Actions>
                    <PromoCard.ActionButton
                        label="Start 14-Day Trial"
                        onClick={() => console.log('Start trial clicked')}
                        variant="primary"
                    />
                </PromoCard.Actions>
            </PromoCard.Content>
        </PromoCard>
        <style>{`
        .video-thumbnail {
            min-height: 109px;
            position: relative;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .video-thumbnail img {
            width: 148px;
            height: 124px;
            position: absolute;
            bottom: -24px;
        }

    `}</style>
    </>
)

export const VideoThumbnailTwoCallToAction: StoryFn = () => (
    <>
        <PromoCard>
            <PromoCard.Media
                style={{
                    background:
                        'linear-gradient(296deg, rgba(210, 155, 255, 0.10) 29.82%, rgba(235, 139, 76, 0.10) 63.34%)',
                }}
            >
                <PromoCard.VideoThumbnail
                    poster={preTrialBannerThumbnail}
                    alt="Shopping Assistant Demo"
                    videoUrl={aiAgentPreviewVideo}
                    className="video-thumbnail"
                />
                <PromoCard.VideoModal videoUrl={aiAgentPreviewVideo} />
            </PromoCard.Media>
            <PromoCard.Content>
                <PromoCard.Header>
                    <PromoCard.Title>Shopping Assistant</PromoCard.Title>
                    <PromoCard.Description>
                        Unlock revenue growth and influence 1.5% in GMV with our
                        AI-powered shopping assistant
                    </PromoCard.Description>
                </PromoCard.Header>
                <PromoCard.Actions>
                    <PromoCard.ActionButton
                        label="Start 14-Day Trial"
                        onClick={() => console.log('Start trial clicked')}
                        variant="primary"
                    />
                    <PromoCard.ActionButton
                        label="Learn More"
                        onClick={() => console.log('Learn more clicked')}
                        variant="ghost"
                    />
                </PromoCard.Actions>
            </PromoCard.Content>
        </PromoCard>
        <style>{`
        .video-thumbnail {
            min-height: 109px;
            position: relative;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .video-thumbnail img {
            width: 148px;
            height: 124px;
            position: absolute;
            bottom: -24px;
        }
    `}</style>
    </>
)

export const VideoThumbnailWithVideoCallToAction: StoryFn = () => (
    <>
        <PromoCard>
            <PromoCard.Media
                style={{
                    background:
                        'linear-gradient(296deg, rgba(210, 155, 255, 0.10) 29.82%, rgba(235, 139, 76, 0.10) 63.34%)',
                }}
            >
                <PromoCard.VideoThumbnail
                    poster={preTrialBannerThumbnail}
                    alt="Shopping Assistant Demo"
                    videoUrl={aiAgentPreviewVideo}
                    className="video-thumbnail"
                />
                <PromoCard.VideoModal
                    videoUrl={aiAgentPreviewVideo}
                    ctaButton={{
                        label: 'Try for 14 days',
                        onClick: () =>
                            console.log(
                                'Video CTA clicked - modal will auto-close',
                            ),
                        variant: 'secondary',
                        className: 'custom-video-end-cta',
                    }}
                />
            </PromoCard.Media>
            <PromoCard.Content>
                <PromoCard.Header>
                    <PromoCard.Title>Shopping Assistant</PromoCard.Title>
                    <PromoCard.Description>
                        Watch the demo to see how our AI assistant can transform
                        your customer experience. The CTA button automatically
                        closes the modal.
                    </PromoCard.Description>
                </PromoCard.Header>
                <PromoCard.Actions>
                    <PromoCard.ActionButton
                        label="Start 14-Day Trial"
                        onClick={() => console.log('Start trial clicked')}
                        variant="primary"
                    />
                    <PromoCard.ActionButton
                        label="Learn More"
                        onClick={() => console.log('Learn more clicked')}
                        variant="ghost"
                    />
                </PromoCard.Actions>
            </PromoCard.Content>
        </PromoCard>
        <style>{`
            .video-thumbnail {
                min-height: 109px;
                position: relative;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .video-thumbnail img {
                width: 148px;
                height: 124px;
                position: absolute;
                bottom: -24px;
            }

            .custom-video-end-cta {
                position: absolute;
                width: 192px;
                top: 86px;
                font-size: 16px;
                padding: 2px 8px;
                line-height: 24px;
                height: 40px;
                font-weight: 600;
                font-feature-settings: 'ss01' on, 'cv10' on;
                font-variant-numeric: lining-nums tabular-nums;
            }
        `}</style>
    </>
)

export const VideoWithExternalLinkCTA: StoryFn = () => (
    <>
        <PromoCard>
            <PromoCard.Media
                style={{
                    background:
                        'linear-gradient(296deg, rgba(210, 155, 255, 0.10) 29.82%, rgba(235, 139, 76, 0.10) 63.34%)',
                }}
            >
                <PromoCard.VideoThumbnail
                    poster={preTrialBannerThumbnail}
                    alt="Demo Video"
                    videoUrl={aiAgentPreviewVideo}
                    className="video-thumbnail"
                />
                <PromoCard.VideoModal
                    videoUrl={aiAgentPreviewVideo}
                    ctaButton={{
                        label: 'Visit Our Website',
                        href: 'https://gorgias.com',
                        target: '_blank',
                    }}
                />
            </PromoCard.Media>
            <PromoCard.Content>
                <PromoCard.Header>
                    <PromoCard.Title>
                        Video with External Link CTA
                    </PromoCard.Title>
                    <PromoCard.Description>
                        The CTA at the end of the video is an external link.
                    </PromoCard.Description>
                </PromoCard.Header>
            </PromoCard.Content>
        </PromoCard>
        <style>{`
            .video-thumbnail {
                min-height: 109px;
                position: relative;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .video-thumbnail img {
                width: 148px;
                height: 124px;
                position: absolute;
                bottom: -24px;
            }
        `}</style>
    </>
)

export const VideoWithInternalLinkCTA: StoryFn = () => (
    <MemoryRouter>
        <PromoCard>
            <PromoCard.Media
                style={{
                    background:
                        'linear-gradient(296deg, rgba(210, 155, 255, 0.10) 29.82%, rgba(235, 139, 76, 0.10) 63.34%)',
                }}
            >
                <PromoCard.VideoThumbnail
                    poster={preTrialBannerThumbnail}
                    alt="Demo Video"
                    videoUrl={aiAgentPreviewVideo}
                    className="video-thumbnail"
                />
                <PromoCard.VideoModal
                    videoUrl={aiAgentPreviewVideo}
                    ctaButton={{
                        label: 'Go to Settings',
                        to: '/settings',
                    }}
                />
            </PromoCard.Media>
            <PromoCard.Content>
                <PromoCard.Header>
                    <PromoCard.Title>
                        Video with Internal Link CTA
                    </PromoCard.Title>
                    <PromoCard.Description>
                        The CTA at the end of the video is an internal router
                        link.
                    </PromoCard.Description>
                </PromoCard.Header>
            </PromoCard.Content>
        </PromoCard>
        <style>{`
            .video-thumbnail {
                min-height: 109px;
                position: relative;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .video-thumbnail img {
                width: 148px;
                height: 124px;
                position: absolute;
                bottom: -24px;
            }
        `}</style>
    </MemoryRouter>
)

export const ImageSingleCallToAction: StoryFn = () => (
    <PromoCard>
        <PromoCard.Media>
            <img
                src={preTrialBannerThumbnail}
                alt="Product Feature"
                style={{ width: '100%', height: 'auto', display: 'block' }}
            />
        </PromoCard.Media>
        <PromoCard.Content>
            <PromoCard.Header>
                <PromoCard.Title>New Feature Launch</PromoCard.Title>
                <PromoCard.Description>
                    Discover our latest feature that will streamline your
                    workflow and boost productivity
                </PromoCard.Description>
            </PromoCard.Header>
            <PromoCard.Actions>
                <PromoCard.ActionButton
                    label="Try It Now"
                    onClick={() => console.log('Try feature clicked')}
                    variant="primary"
                />
            </PromoCard.Actions>
        </PromoCard.Content>
    </PromoCard>
)

export const ImageTwoCallToActions: StoryFn = () => (
    <PromoCard>
        <PromoCard.Media>
            <img
                src={preTrialBannerThumbnail}
                alt="Product Feature"
                style={{ width: '100%', height: 'auto', display: 'block' }}
            />
        </PromoCard.Media>
        <PromoCard.Content>
            <PromoCard.Header>
                <PromoCard.Title>New Feature Launch</PromoCard.Title>
                <PromoCard.Description>
                    Discover our latest feature that will streamline your
                    workflow and boost productivity
                </PromoCard.Description>
            </PromoCard.Header>
            <PromoCard.Actions>
                <PromoCard.ActionButton
                    label="Try It Now"
                    onClick={() => console.log('Try feature clicked')}
                    variant="primary"
                />
                <PromoCard.ActionButton
                    label="Read Documentation"
                    onClick={() => console.log('Documentation clicked')}
                    variant="ghost"
                />
            </PromoCard.Actions>
        </PromoCard.Content>
    </PromoCard>
)

export const TextOnlySingleCallToAction: StoryFn = () => (
    <PromoCard>
        <PromoCard.Content>
            <PromoCard.Header>
                <PromoCard.Title>Account Upgrade</PromoCard.Title>
                <PromoCard.Description>
                    Unlock premium features and get priority support with our
                    Pro plan. No setup fees, cancel anytime.
                </PromoCard.Description>
            </PromoCard.Header>
            <PromoCard.Actions>
                <PromoCard.ActionButton
                    label="Upgrade to Pro"
                    onClick={() => console.log('Upgrade clicked')}
                    variant="primary"
                />
            </PromoCard.Actions>
        </PromoCard.Content>
    </PromoCard>
)

export const ProgressBarDefault: StoryFn = () => (
    <PromoCard>
        <PromoCard.Content>
            <PromoCard.Header>
                <PromoCard.Title>Trial Period</PromoCard.Title>
                <PromoCard.Description>
                    Your trial is ending soon. Upgrade now to continue using all
                    features.
                </PromoCard.Description>
            </PromoCard.Header>
            <PromoCard.ProgressBar percentage={75}>
                <PromoCard.Text style={{ marginTop: '8px', fontSize: '11px' }}>
                    7 days remaining
                </PromoCard.Text>
            </PromoCard.ProgressBar>
            <PromoCard.Actions>
                <PromoCard.ActionButton
                    label="Upgrade Now"
                    onClick={() => console.log('Upgrade clicked')}
                    variant="primary"
                />
            </PromoCard.Actions>
        </PromoCard.Content>
    </PromoCard>
)

export const ProgressBarGradient: StoryFn = () => (
    <PromoCard>
        <PromoCard.Content>
            <PromoCard.Header>
                <PromoCard.Title>Shopping Assistant Trial</PromoCard.Title>
                <PromoCard.Description>
                    Track your trial progress and see the benefits of our AI
                    assistant
                </PromoCard.Description>
            </PromoCard.Header>
            <PromoCard.ProgressBar
                percentage={100}
                fillColor="linear-gradient(116deg, rgba(235, 139, 76, 0.90) 4.95%, rgba(210, 155, 255, 0.90) 60.81%)"
                trackColor="#f0f0f0"
            >
                <PromoCard.Text style={{ marginTop: '8px', fontSize: '11px' }}>
                    14 days left
                </PromoCard.Text>
            </PromoCard.ProgressBar>
            <PromoCard.Actions>
                <PromoCard.ActionButton
                    label="Extend Trial"
                    onClick={() => console.log('Extend trial clicked')}
                    variant="primary"
                />
            </PromoCard.Actions>
        </PromoCard.Content>
    </PromoCard>
)

export const ProgressBarGradientTwoCallToActions: StoryFn = () => (
    <PromoCard>
        <PromoCard.Content>
            <PromoCard.Header>
                <PromoCard.Title>Shopping Assistant Trial</PromoCard.Title>
                <PromoCard.Description>
                    Track your trial progress and see the benefits of our AI
                    assistant
                </PromoCard.Description>
            </PromoCard.Header>
            <PromoCard.ProgressBar
                percentage={85}
                fillColor="linear-gradient(116deg, rgba(235, 139, 76, 0.90) 4.95%, rgba(210, 155, 255, 0.90) 60.81%)"
                trackColor="#f0f0f0"
                height={10}
            >
                <PromoCard.Text
                    style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: '#ff3d71',
                    }}
                >
                    3 days left
                </PromoCard.Text>
            </PromoCard.ProgressBar>
            <PromoCard.Actions>
                <PromoCard.ActionButton
                    label="Upgrade Now"
                    onClick={() => console.log('Upgrade clicked')}
                    variant="primary"
                />
                <PromoCard.ActionButton
                    label="Extend Trial"
                    onClick={() => console.log('Extend trial clicked')}
                    variant="ghost"
                />
            </PromoCard.Actions>
        </PromoCard.Content>
    </PromoCard>
)

export const CollapsibleExpanded: StoryFn = () => (
    <PromoCard collapsible>
        <PromoCard.Content>
            <PromoCard.Header>
                <PromoCard.Title>Collapsible Card - Expanded</PromoCard.Title>
                <PromoCard.Description>
                    Click the chevron to collapse/expand this card
                </PromoCard.Description>
            </PromoCard.Header>
            <PromoCard.Text>
                This content will be hidden when the card is collapsed. Only the
                title with chevron will remain visible.
            </PromoCard.Text>
            <PromoCard.Actions>
                <PromoCard.ActionButton
                    label="Action Button"
                    onClick={() => console.log('Action clicked')}
                    variant="primary"
                />
            </PromoCard.Actions>
        </PromoCard.Content>
    </PromoCard>
)

export const CollapsibleCollapsed: StoryFn = () => (
    <PromoCard collapsible defaultCollapsed>
        <PromoCard.Content>
            <PromoCard.Header>
                <PromoCard.Title>Collapsible Card - Collapsed</PromoCard.Title>
                <PromoCard.Description>
                    This card starts collapsed. Click chevron to expand.
                </PromoCard.Description>
            </PromoCard.Header>
            <PromoCard.Text>
                You&apos;ll see this content when you expand the card.
            </PromoCard.Text>
            <PromoCard.Actions>
                <PromoCard.ActionButton
                    label="Hidden Action"
                    onClick={() => console.log('Hidden action clicked')}
                    variant="secondary"
                />
            </PromoCard.Actions>
        </PromoCard.Content>
    </PromoCard>
)

export const CollapsibleWithMedia: StoryFn = () => (
    <>
        <PromoCard collapsible>
            <PromoCard.Content>
                <PromoCard.Header>
                    <PromoCard.Title>Collapsible with Media</PromoCard.Title>
                    <PromoCard.Description>
                        Media content is also hidden when collapsed
                    </PromoCard.Description>
                </PromoCard.Header>
                <PromoCard.Media
                    style={{
                        background:
                            'linear-gradient(296deg, rgba(210, 155, 255, 0.10) 29.82%, rgba(235, 139, 76, 0.10) 63.34%)',
                    }}
                >
                    <PromoCard.VideoThumbnail
                        poster={preTrialBannerThumbnail}
                        alt="Demo Video"
                        videoUrl={aiAgentPreviewVideo}
                        className="video-thumbnail"
                    />
                    <PromoCard.VideoModal videoUrl={aiAgentPreviewVideo} />
                </PromoCard.Media>
                <PromoCard.Actions>
                    <PromoCard.ActionButton
                        label="Watch Demo"
                        onClick={() => console.log('Demo clicked')}
                        variant="primary"
                    />
                </PromoCard.Actions>
            </PromoCard.Content>
        </PromoCard>
        <style>{`
        .video-thumbnail {
            min-height: 109px;
            position: relative;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .video-thumbnail img {
            width: 148px;
            height: 124px;
            position: absolute;
            bottom: -24px;
        }
    `}</style>
    </>
)

export const ActionButtonExternalLink: StoryFn = () => (
    <PromoCard>
        <PromoCard.Content>
            <PromoCard.Header>
                <PromoCard.Title>External Link Action</PromoCard.Title>
                <PromoCard.Description>
                    ActionButton rendered as external link with proper security
                    attributes
                </PromoCard.Description>
            </PromoCard.Header>
            <PromoCard.Actions>
                <PromoCard.ActionButton
                    label="Visit Gorgias Website"
                    href="https://www.gorgias.com"
                    target="_blank"
                    variant="primary"
                />
                <PromoCard.ActionButton
                    label="View Documentation"
                    href="https://docs.gorgias.com"
                    target="_blank"
                    variant="ghost"
                />
            </PromoCard.Actions>
        </PromoCard.Content>
    </PromoCard>
)

export const ActionButtonInternalLink: StoryFn = () => (
    <MemoryRouter>
        <PromoCard>
            <PromoCard.Content>
                <PromoCard.Header>
                    <PromoCard.Title>
                        Internal Router Link Action
                    </PromoCard.Title>
                    <PromoCard.Description>
                        ActionButton rendered as internal router link using
                        React Router
                    </PromoCard.Description>
                </PromoCard.Header>
                <PromoCard.Actions>
                    <PromoCard.ActionButton
                        label="Go to Settings"
                        to="/settings"
                        variant="primary"
                    />
                    <PromoCard.ActionButton
                        label="View Profile"
                        to="/profile"
                        variant="secondary"
                    />
                </PromoCard.Actions>
            </PromoCard.Content>
        </PromoCard>
    </MemoryRouter>
)

export const ActionButtonMixedTypes: StoryFn = () => (
    <MemoryRouter>
        <PromoCard>
            <PromoCard.Content>
                <PromoCard.Header>
                    <PromoCard.Title>Mixed Action Types</PromoCard.Title>
                    <PromoCard.Description>
                        Demonstrates button, internal link, and external link in
                        one component
                    </PromoCard.Description>
                </PromoCard.Header>
                <PromoCard.Actions>
                    <PromoCard.ActionButton
                        label="Save Changes"
                        onClick={() => console.log('action button clicked')}
                        variant="primary"
                    />
                    <PromoCard.ActionButton
                        label="Go to Dashboard"
                        to="/dashboard"
                        variant="secondary"
                    />
                    <PromoCard.ActionButton
                        label="Get Help"
                        href="https://help.gorgias.com"
                        target="_blank"
                        variant="ghost"
                    />
                </PromoCard.Actions>
            </PromoCard.Content>
        </PromoCard>
    </MemoryRouter>
)
