import {RuleEngineDataContext, RuleEngineRoutesContext} from '../ruleEngine'

export abstract class Task {
    public readonly display: boolean
    public readonly featureUrl: string

    constructor(
        public readonly title: string,
        public readonly caption: string,
        public readonly type: 'BASIC' | 'RECOMMENDED',
        protected readonly data: RuleEngineDataContext,
        protected readonly routes: RuleEngineRoutesContext
    ) {
        this.display = this.shouldBeDisplayed(data)
        this.featureUrl = this.getFeatureUrl(data, routes)
    }

    protected abstract shouldBeDisplayed(data: RuleEngineDataContext): boolean
    protected abstract getFeatureUrl(
        data: RuleEngineDataContext,
        routes: RuleEngineRoutesContext
    ): string
}
