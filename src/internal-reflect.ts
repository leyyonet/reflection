import {leyyo} from "@leyyo/core";
import {Fqn} from "@leyyo/fqn";
import {LyyClassLambda, LyyIdentifierLambda} from "./internal-types";
import {DecoFilter} from "./index-types";
import {FQN_NAME} from "./internal-component";

@Fqn(...FQN_NAME)
export class InternalReflect {
    private static FILTER = {
        belongs: ['self', 'parent'],
        scope: ['owned', 'inherited'],
        kind: ['field', 'method'],
        keyword: ['static', 'instance'],
    };
    /**
     * Gets an identifier with identifier instance[yes self], function or function name [and also FQN name]
     * - Default value of throwable is true, so if true, it will raise when it could not find the decorator
     *
     * @internal - don't use it
     * @throws - DeveloperException(identifier.not.found)
     * */
    static identifier: LyyIdentifierLambda;
    static setIdentifier(lambda: LyyIdentifierLambda): void {
        this.identifier = lambda;
    }
    static clazz: LyyClassLambda;
    static setClass(lambda: LyyClassLambda): void {
        this.clazz = lambda;
    }
    static FFF<T = DecoFilter>(FFF: T, ...conditions: Array<'belongs'|'scope'|'keyword'|'kind'>): T {
        FFF = (leyyo.primitive.object(FFF) ?? {}) as T;
        conditions.forEach(condition => {
            if (FFF[condition] !== undefined && InternalReflect.FILTER[condition] !== undefined) {
                if (!InternalReflect.FILTER[condition].includes(FFF[condition])) {
                    delete FFF[condition];
                }
            }
        });
        return FFF;
    }
}