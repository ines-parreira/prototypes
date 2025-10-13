import { RuleEngineData, RuleEngineRoutes } from '../ruleEngine'

export abstract class Task {
    public readonly display: boolean
    public readonly featureUrl: string
    public readonly available: boolean
    public readonly isCheckedAutomatically: boolean
    public readonly completed: boolean
    public readonly alwaysAvailable: boolean

    protected constructor(
        public readonly title: string,
        public readonly caption: string,
        public readonly type: 'BASIC' | 'RECOMMENDED',
        protected readonly data: RuleEngineData,
        protected readonly routes: RuleEngineRoutes,
    ) {
        this.available = this.isAvailable(data)
        this.display = this.shouldBeDisplayed(data)
        this.featureUrl = this.getFeatureUrl({ data, routes })
        this.isCheckedAutomatically = this.getIsCheckedAutomatically
            ? this.getIsCheckedAutomatically(data)
            : false
        this.completed = this.getIsCompleted
            ? this.getIsCompleted
                ? this.getIsCompleted(data)
                : false
            : !this.display
        this.alwaysAvailable = this.isAlwaysAvailable
            ? this.isAlwaysAvailable()
            : false
    }

    protected abstract isAvailable(data: RuleEngineData): boolean
    protected abstract shouldBeDisplayed(data: RuleEngineData): boolean
    protected abstract getFeatureUrl({
        data,
        routes,
    }: {
        data: RuleEngineData
        routes: RuleEngineRoutes
    }): string
    protected getIsCheckedAutomatically?(data: RuleEngineData): boolean
    protected getIsCompleted?(data: RuleEngineData): boolean
    protected isAlwaysAvailable?(): boolean
}
