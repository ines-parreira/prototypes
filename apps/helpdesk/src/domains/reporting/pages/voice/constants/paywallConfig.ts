import { assetsUrl } from 'utils'

const paywallConfig = {
    greyButtonText: 'Learn more',
    greyButtonUrl: 'https://docs.gorgias.com/en-US/articles/voice-57524',
    primaryButtonText: 'Add voice',
    primaryButtonUrl: '/app/settings/channels/phone/new',
    paywallTitle: 'Voice add-on features',
    descriptions: [
        'Create phone numbers, answer incoming customer calls, and make outbound calls from your helpdesk.',
        'Manage and monitor call and agent performance.',
        'Gain insights into queue status and agent availability.',
        'Save time with call and voicemail transcriptions.',
    ],
    slidesData: [
        {
            imageUrl: assetsUrl('/img/paywalls/screens/voice-live-calls.png'),
            description:
                'Effortlessly track key metrics with our Live Voice report, which offers real-time insights into queues and agent availability.',
        },
        {
            imageUrl: assetsUrl('/img/paywalls/screens/voice-ivr.png'),
            description:
                'Create a seamless customer experience with IVR by routing phone calls efficiently, including directly to SMS.',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/voice-events-timeline.png',
            ),
            description:
                'View a complete timeline of all phone call events, from start to finish, for full visibility into every interaction.',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/voice-transcription.png',
            ),
            description:
                'All recorded calls and voicemails are automatically transcribed and summarized for quick and easy review.',
        },
    ],
}

export default paywallConfig
