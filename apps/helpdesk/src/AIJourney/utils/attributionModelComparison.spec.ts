import {
    ATTRIBUTION_MODEL_HINTS,
    ATTRIBUTION_MODEL_LABELS,
    ATTRIBUTION_MODELS,
    buildProviderMetricPair,
    providerMetricIds,
} from './attributionModelComparison'

jest.mock('domains/reporting/hooks/useTimeSeries', () => ({
    seriesToTwoDimensionalDataItem: jest
        .fn()
        .mockImplementation((_series, opts) => [{ label: opts?.label ?? '' }]),
}))

const mockOrdersData = {
    label: 'Orders',
    value: 10,
    prevValue: 8,
    series: [],
    interpretAs: 'more-is-better' as const,
    isLoading: false,
    metricFormat: 'decimal-precision-1' as const,
}

const mockSalesData = {
    label: 'Total sales',
    value: 1000,
    prevValue: null,
    series: [],
    interpretAs: 'more-is-better' as const,
    isLoading: false,
    metricFormat: 'currency' as const,
    currency: 'USD',
}

const mockDrillDown = {
    openDrillDownModal: jest.fn(),
    tooltipText: 'View tickets',
}

describe('attributionModelComparison', () => {
    describe('ATTRIBUTION_MODELS', () => {
        it('should contain all six providers in the correct order', () => {
            expect(ATTRIBUTION_MODELS).toEqual([
                'klaviyo',
                'attentive',
                'postscript',
                'liverecover',
                '2-day-click',
                '3-day-click',
            ])
        })
    })

    describe('ATTRIBUTION_MODEL_LABELS', () => {
        it('should have a label for each model', () => {
            for (const model of ATTRIBUTION_MODELS) {
                expect(ATTRIBUTION_MODEL_LABELS[model]).toBeTruthy()
            }
        })
    })

    describe('ATTRIBUTION_MODEL_HINTS', () => {
        it('should have a hint for each model', () => {
            for (const model of ATTRIBUTION_MODELS) {
                expect(ATTRIBUTION_MODEL_HINTS[model]).toBeTruthy()
            }
        })
    })

    describe('providerMetricIds', () => {
        it.each([
            [
                'klaviyo',
                'Total sales (click 5d > delivery 12h)',
                'Orders (click 5d > delivery 12h)',
            ],
            [
                'attentive',
                'Total sales (click 5d > delivery 24h)',
                'Orders (click 5d > delivery 24h)',
            ],
            [
                'postscript',
                'Total sales (click 7d > delivery 24h)',
                'Orders (click 7d > delivery 24h)',
            ],
            [
                'liverecover',
                'Total sales (discount 10d > delivery 20d)',
                'Orders (discount 10d > delivery 20d)',
            ],
            ['2-day-click', 'Total sales (click 2d)', 'Orders (click 2d)'],
            ['3-day-click', 'Total sales (click 3d)', 'Orders (click 3d)'],
        ] as const)(
            'should return correct IDs for %s',
            (model, expectedTotalSales, expectedOrders) => {
                const ids = providerMetricIds(model)
                expect(ids.totalSales).toBe(expectedTotalSales)
                expect(ids.orders).toBe(expectedOrders)
            },
        )
    })

    describe('buildProviderMetricPair', () => {
        const mockProviderData = {
            label: ATTRIBUTION_MODEL_LABELS.klaviyo,
            orders: mockOrdersData,
            totalSales: mockSalesData,
            ordersDrillDown: mockDrillDown,
        }

        it('should return a pair of two metric objects', () => {
            const result = buildProviderMetricPair(
                'klaviyo',
                mockProviderData,
                {},
            )
            expect(result).toHaveLength(2)
        })

        it('should set correct IDs and labels for total sales metric', () => {
            const [totalSales] = buildProviderMetricPair(
                'klaviyo',
                mockProviderData,
                {},
            )
            expect(totalSales.id).toBe('Total sales (click 5d > delivery 12h)')
            expect(totalSales.label).toBe(
                'Total sales (click 5d > delivery 12h)',
            )
            expect(totalSales.metricFormat).toBe('currency')
        })

        it('should set correct IDs and labels for orders metric', () => {
            const [, orders] = buildProviderMetricPair(
                'klaviyo',
                mockProviderData,
                {},
            )
            expect(orders.id).toBe('Orders (click 5d > delivery 12h)')
            expect(orders.label).toBe('Orders (click 5d > delivery 12h)')
            expect(orders.metricFormat).toBe('decimal-precision-1')
        })

        it('should embed the model hint in the hint field', () => {
            const [totalSales, orders] = buildProviderMetricPair(
                'klaviyo',
                mockProviderData,
                {},
            )
            expect(totalSales.hint).toContain(ATTRIBUTION_MODEL_HINTS.klaviyo)
            expect(orders.hint).toContain(ATTRIBUTION_MODEL_HINTS.klaviyo)
        })

        it('should carry trend values from provider data', () => {
            const [totalSales, orders] = buildProviderMetricPair(
                'klaviyo',
                mockProviderData,
                {},
            )
            expect(totalSales.trend).toEqual({ value: 1000, prevValue: null })
            expect(orders.trend).toEqual({ value: 10, prevValue: 8 })
        })

        it('should use the actual prevValue when totalSales.prevValue is non-null', () => {
            const dataWithPrev = {
                ...mockProviderData,
                totalSales: { ...mockSalesData, prevValue: 800 },
            }
            const [totalSales] = buildProviderMetricPair(
                'klaviyo',
                dataWithPrev,
                {},
            )
            expect(totalSales.trend).toEqual({ value: 1000, prevValue: 800 })
        })

        it('should attach drillDown to the orders metric only', () => {
            const [totalSales, orders] = buildProviderMetricPair(
                'klaviyo',
                mockProviderData,
                {},
            )
            expect(orders.drillDown).toBe(mockDrillDown)
            expect(totalSales).not.toHaveProperty('drillDown')
        })
    })
})
