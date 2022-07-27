import {FuncLike, RecLike} from "@leyyo/core";
import {fqn, Fqn} from "@leyyo/fqn";
import {DecoAliasLambda, DecoAliasLike, DecoIdLike} from "./index-types";
import {FQN_NAME} from "./internal-component";

@Fqn(...FQN_NAME)
export class DecoAlias<V extends RecLike = RecLike, S = unknown> implements DecoAliasLike<V, S> {
    private readonly _fn: FuncLike;
    private readonly _id: DecoIdLike<V, S>;
    private readonly _condition: DecoAliasLambda<V, S>;

    constructor(fn: FuncLike, id: DecoIdLike<V, S>, condition: DecoAliasLambda<V, S>) {
        this._fn = fn;
        this._id = id;
        this._condition = condition;
    }
    info(detailed?: boolean): RecLike {
        return {
            name: this.name,
            identifier: {'$ref': this._id.description},
        }
    }
    get description(): string {
        return `<alias>${this.name}`;
    }
    get name(): string {return fqn.name(this._fn);}
    get fn(): FuncLike {return this._fn;}
    get id(): DecoIdLike<V, S> {return this._id;}
    get condition(): DecoAliasLambda<V, S> {return this._condition;}
}






