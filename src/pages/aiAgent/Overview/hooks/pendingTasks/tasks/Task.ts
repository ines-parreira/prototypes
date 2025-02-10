import {RuleEngineData, RuleEngineRoutes} from '../ruleEngine'

export abstract class Task {
    public readonly display: boolean
    public readonly featureUrl: string

    constructor(
        public readonly title: string,
        public readonly caption: string,
        public readonly type: 'BASIC' | 'RECOMMENDED',
        protected readonly data: RuleEngineData,
        protected readonly routes: RuleEngineRoutes
    ) {
        this.display = this.shouldBeDisplayed(data)
        this.featureUrl = this.getFeatureUrl(data, routes)
    }

    protected abstract shouldBeDisplayed(data: RuleEngineData): boolean
    protected abstract getFeatureUrl(
        data: RuleEngineData,
        routes: RuleEngineRoutes
    ): string
}
