import {printDetailed} from "@leyyo/core";
import {Fqn, fqn} from "@leyyo/fqn";
import {reflectPool} from "../reflect-pool";
import {C, F, M, P} from "../index-annotations";

export function ForClass1():ClassDecorator {
    return (target => {
        forClass1.fork(target).set({c:1});
    });
}
const forClass1 = reflectPool.identify(ForClass1, {});

export function ForMethod1():MethodDecorator {
    return ((target, propertyKey, descriptor) => {
        forMethod1.fork(target, propertyKey, descriptor).set({b:1});
    });
}
const forMethod1 = reflectPool.identify(ForMethod1, {method: true});

export function ForField1():PropertyDecorator {
    return ((target, propertyKey) => {
        forField1.fork(target, propertyKey).set({a:1});
    });
}
const forField1 = reflectPool.identify(ForField1, {field: true});

@Fqn('sample')
@C()
export class ClassReturn {

}

@Fqn('sample')
@C()
export class Class0 {
    @F()
    instanceField1: number = null;
    @F()
    instanceField2: ClassReturn = null;
    @F()
    static staticField1: ClassReturn = null;
    @F()
    static staticField2: ClassReturn = null;

    @M()
    instanceMethod1(@P("p1") p1: string): ClassReturn {
        return null;
    }
    @M()
    instanceMethod2(@P("p2a") p2a: string, @P("p2b") p2b: number): ClassReturn {
        return null;
    }
    @M()
    static staticMethod1(@P("p1") p1: string): ClassReturn {
        return null;
    }
    @M()
    static staticMethod2(@P("p2a") p2a: string, @P("p2b") p2b: number): ClassReturn {
        return null;
    }
}

@Fqn('sample')
@C()
export class Class1 extends Class0 {
    @F()
    instanceField2: ClassReturn = null;
    @F()
    instanceField3: ClassReturn = null;
    @F()
    static staticField2: ClassReturn = null;
    @F()
    static staticField3: ClassReturn = null;
    @M()
    instanceMethod2(@P("p2a") p2a: string, @P("p2b") p2b: number): ClassReturn {
        return null;
    }
    @M()
    instanceMethod3(@P("p3a") p3a: string, @P("p3b") p3b: number, @P("p3c") p3c: boolean, @P("p3d") p3d: ClassReturn): ClassReturn {
        return null;
    }
    @M()
    static staticMethod2(@P("p2a") p2a: string, @P("p2b") p2b: number): ClassReturn {
        return null;
    }
    @M()
    static staticMethod3(@P("p3a") p3a: string, @P("p3b") p3b: number, @P("p3c") p3c: boolean, @P("p3d") p3d: ClassReturn): ClassReturn {
        return null;
    }
}

export function sample1() {
    // printDetailed(reflectPool.getIdentifier(ForClass1).info(true));
    // printDetailed(fqn.name(Class1), reflectPool.getClass(Class1).info(true));
    printDetailed(fqn.name(Class1), reflectPool.getClass(Class1).listAnyProperties().map(p => p.info(false)));
}