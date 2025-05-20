import { assetsUrl } from 'utils'

const dummyProducts = [
    {
        id: '1',
        name: 'SonicWave Pro Noise-Canceling Headphones SWP-NC500',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_01.png'),
        intent: 'Can I reactivate a lost gift card',
    },
    {
        id: '2',
        name: 'EchoBlast Wireless Earbuds EBW-EB300X',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_02.png'),
        intent: 'Need to properly use earbuds wirelessly',
    },
    {
        id: '3',
        name: 'ThunderBass 2.1 Bluetooth Speaker TB21-BS700',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_03.png'),
        intent: 'Can I send evidence of my damaged items for refunds request',
    },
    {
        id: '4',
        name: 'Aurabeam Studio Microphone ABM-SM900',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_04.png'),
        intent: 'what is the longevity of the waterproof earbuds',
    },
    {
        id: '5',
        name: 'Resonix Home Theater Soundbar RHT-SB750',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_05.png'),
        intent: 'Refund Requests due to damage on arrival',
    },
    {
        id: '6',
        name: 'QuickSync Wireless Turntable WSW-TT200',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_06.png'),
        intent: 'Information about the quicksync wireless turntable',
    },
    {
        id: '7',
        name: 'QuietPod Construction Headphones PX-BCH450',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_07.png'),
        intent: 'Claim that construction is still being heard in quetpod',
    },
    {
        id: '8',
        name: 'New Jazz Turntable JT-0198FB',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_08.png'),
        intent: 'Refund is needed for a lot of different construction',
    },
    {
        id: '9',
        name: 'Floating Record player BT-BC9871',
        thumbnailUrl: assetsUrl('/img/stats/voc-preview/product_09.png'),
        intent: 'Why is the color scratching off of the headphones',
    },
]

export const useSortedProductsWithData = () => {
    return { products: dummyProducts, isLoading: false }
}
