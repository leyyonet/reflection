import {FuncOrName, ObjectLike, RecLike} from "../../core";
import {ClassReflectLike, DecoAliasLike, DecoIdLike, DecoIdType, DecoInstanceLike, FuncOrDecoId} from "./index-types";

export type LyyIdentifierLambda<V extends RecLike = RecLike, S = unknown> = (fn: FuncOrDecoId, throwable?: boolean) => DecoIdLike<V, S>;
export type LyyClassLambda = (fn: FuncOrName, body?: ObjectLike, currentInstance?: DecoInstanceLike) => ClassReflectLike;
/**
 * It's used to find decorator and it's type
 *
 * @internal - don't use it
 * */
export interface LyyDecoGetResult {
    /**
     * Type of decorator, it could not be found then it will be null
     * @see {@link DecoIdType}
     * */
    type?: DecoIdType;
    /**
     * Identifier decorator if type=identifier
     * */
    id?: DecoIdLike;
    /**
     * alias decorator if type=alias
     * */
    alias?: DecoAliasLike;
}
