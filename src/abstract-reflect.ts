import {DeveloperException, leyyo, RecLike} from "@leyyo/core";
import {Fqn} from "@leyyo/fqn";
import {CoreReflectLike, DecoFilterBelongs, DecoIdLike, DecoInstanceLike, FuncOrDecoId} from "./index-types";
import {FQN_NAME} from "./internal-component";
import {Target} from "./index-enums";
import {InternalReflect} from "./internal-reflect";

@Fqn(...FQN_NAME)
export abstract class AbstractReflect implements CoreReflectLike {
    // region properties
    protected _targetType: Target;
    protected _currentInstance: DecoInstanceLike;
    protected readonly _decoratorMap: Map<DecoIdLike, Array<RecLike>>;
    protected readonly _emptyDecoMap = new Map<DecoIdLike, Array<RecLike>>();
    // endregion properties
    protected constructor(currentInstance?: DecoInstanceLike) {
        this._currentInstance = currentInstance;
        this._decoratorMap = new Map<DecoIdLike, Array<RecLike>>();
    }
    // region private
    private _check(id: DecoIdLike): Array<RecLike> {
        if (!this._decoratorMap.has(id)) {
            this._decoratorMap.set(id, []);
        }
        return this._decoratorMap.get(id);
    }
    private static _castValue(data: unknown): RecLike {
        return leyyo.primitive.object(data) ?? {};
    }
    // endregion private
    // region getters
    info(detailed?: boolean): RecLike {
        const result = {identifiers: []};
        for (const [id, item] of this._decoratorMap.entries()) {
            result.identifiers.push({
                identifier: {'$ref': id.description},
                values: item,
            });
        }
        return result;
    }
    abstract get description(): string;
    get targetType(): Target {
        return this._targetType;
    }
    get currentIdentifier(): DecoIdLike {
        return this._currentInstance?.identifier ?? null;
    }
    get currentInstance(): DecoInstanceLike {
        return this._currentInstance;
    }
    // endregion getters
    // region lyy
    lyyInstance(currentInstance: DecoInstanceLike): this {
        this._currentInstance = currentInstance;
        return this;
    }
    lyyToLastIdentifier(value: RecLike): this {
        return this.setValue(this.currentIdentifier, value);
    }
    lyyDecorators(FFF?: DecoFilterBelongs): Map<DecoIdLike, Array<RecLike>> {
        return this._decoratorMap;
    }
    // endregion lyy
    // region decorator
    setValue(identifier: FuncOrDecoId, value: RecLike): this {
        const id = InternalReflect.identifier(identifier, true);
        if (!id.notMultiple) {
            this._check(id).push(AbstractReflect._castValue(value));
        } else {
            this._decoratorMap.set(id, [AbstractReflect._castValue(value)]);
        }
        return this;
    }
    decorators(FFF?: DecoFilterBelongs): Record<string, Array<RecLike>> {
        const result: Record<string, Array<RecLike>> = {};
        for (const [id, item] of this.lyyDecorators(FFF).entries()) {
            result[id.name] = item;
        }
        return result;
    }
    hasDecorator(identifier: FuncOrDecoId, FFF?: DecoFilterBelongs): boolean {
        const id = InternalReflect.identifier(identifier, false);
        return id && this.lyyDecorators(FFF).has(id);
    }
    listValues<V extends RecLike = RecLike>(identifier: FuncOrDecoId, FFF?: DecoFilterBelongs): Array<V> {
        const id = InternalReflect.identifier(identifier, false);
        const map = this.lyyDecorators(FFF);
        if (id && map.has(id)) {
            return map.get(id) as Array<V>;
        }
        return [];
    }
    getValue<V extends RecLike = RecLike>(identifier: FuncOrDecoId, FFF?: DecoFilterBelongs): V {
        const list = this.listValues<V>(identifier, FFF);
        return list.length > 0 ? list[0] : null;
    }
    listSingles<S = unknown>(identifier: FuncOrDecoId, FFF?: DecoFilterBelongs): Array<S> {
        const id = InternalReflect.identifier(identifier, false);
        if (!id.single) {
            throw new DeveloperException('single.not.supported', {decorator: id.name, owner: this.description});
        }
        const recs = this.listValues(id, FFF);
        return recs.map(rec => rec[id.single] as S ?? null);
    }
    getSingle<S = unknown>(identifier: FuncOrDecoId, FFF?: DecoFilterBelongs): S {
        const list = this.listSingles<S>(identifier, FFF);
        return list.length > 0 ? list[0] : null;
    }
    // endregion decorator
    // region filter-by
    filterByBelongs(identifier: FuncOrDecoId, FFF?: DecoFilterBelongs): boolean {
        return this.hasDecorator(identifier, FFF);
    }
    filterByTarget(...targets: Array<Target>): boolean {
        return targets.length < 1 || targets.includes(this._targetType);
    }
    // endregion filter-by
}
