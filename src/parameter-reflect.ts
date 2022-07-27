import {FuncLike, RecLike} from "@leyyo/core";
import {fqn, Fqn} from "@leyyo/fqn";
import {AbstractReflect} from "./abstract-reflect";
import {FuncOrDecoId, ParameterReflectLike, PropertyReflectLike} from "./index-types";
import {FQN_NAME} from "./internal-component";
import {Target} from "./index-enums";

@Fqn(...FQN_NAME)
export class ParameterReflect extends AbstractReflect implements ParameterReflectLike {
    // region properties
    private readonly _property: PropertyReflectLike;
    private readonly _index: number;
    private readonly _type: FuncLike;
    // endregion properties

    constructor(property: PropertyReflectLike, index: number, type: FuncLike) {
        super(property.currentInstance);
        this._targetType = Target.PARAMETER;
        this._property = property;
        this._index = index;
        this._type = typeof type === 'function' ? type : null;
    }

    // region getters
    info(detailed?: boolean): RecLike {
        if (!detailed) {
            return {
                index: this._index,
                type: fqn.signed(this._type, true),
            }
        }
        return {
            index: this._index,
            description: this.description,
            property: {'$ref': this._property.description},
            type: fqn.signed(this._type, true),
        }
    }
    get property(): PropertyReflectLike {
        return this._property;
    }
    get index(): number {
        return this._index;
    }
    get type(): FuncLike {
        return this._type;
    }
    get description(): string {
        return `<parameter}>${this._property.clazz.name}.${this._property.name as string}#${this._index} [${this._property.keyword}]`;
    }
    // endregion getters

    // region decorator
    decorators(): Record<string, Array<RecLike>> {
        return super.decorators();
    }
    hasDecorator(identifier: FuncOrDecoId): boolean {
        return super.hasDecorator(identifier);
    }
    listValues<V extends RecLike = RecLike>(identifier: FuncOrDecoId): Array<V> {
        return super.listValues<V>(identifier);
    }
    getValue<V extends RecLike = RecLike>(identifier: FuncOrDecoId): V {
        return super.getValue<V>(identifier);
    }
    listSingles<S = unknown>(identifier: FuncOrDecoId): Array<S> {
        return super.listSingles<S>(identifier);
    }
    getSingle<S = unknown>(identifier: FuncOrDecoId): S {
        return super.getSingle<S>(identifier);
    }
    // endregion decorator

}
