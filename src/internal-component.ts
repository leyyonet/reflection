import {LEYYO_KEY, LEYYO_NAME} from "@leyyo/core";

export const SHORT_NAME = 'ref';
export const BASE_NAME = 'reflection';
export const COMPONENT_NAME = `@${LEYYO_NAME}/${BASE_NAME}`;
export const FQN_NAME = [LEYYO_NAME, BASE_NAME];
export const DECO_KEY = Symbol.for(`${LEYYO_KEY}${SHORT_NAME}/d`);