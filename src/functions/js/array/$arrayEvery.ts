import { TranspilerError } from "../../../core/error.js";
import Scope from "../../../core/structs/Scope.js";
import { Transpiler, conditionLexer, functions } from "../../../index.js";
import { FunctionData, funcData } from "../../../typings/interfaces.js";
import {
    escapeResult,
    escapeVars,
    getFunctionList,
    parseResult,
} from "../../../util/transpilerHelpers.js";
export const $arrayEvery: FunctionData = {
    name: "$arrayEvery",
    brackets: true,
    optional: false,
    type: "scope_getter",
    fields: [
        {
            name: "name",
            type: "string",
            required: true,
        },
        {
            name: "query",
            type: "function",
            required: true,
        },
    ],
    description: "checks if every element in the array passes the test",
    default: ["void", "void"],
    returns: "boolean",
    version: "7.0.0",
    code: (data: funcData, scope: Scope[]) => {
        const [name, ...values] = data.splits;
        const currentScope = scope[scope.length - 1];
        if (
            !currentScope.variables.includes(name) &&
            !currentScope.name.startsWith("$try_") &&
            !currentScope.name.startsWith("$catch_")
        )
            throw new TranspilerError(
                `${data.name}: Variable ${name} does not exists`,
            );

        const condition = values.join(";");
        const conditionFunctionList = getFunctionList(
            condition,
            Object.keys(functions),
        );
        let executedCondition;
        if (conditionFunctionList.length) {
            executedCondition = Transpiler(condition, {
                sendMessage: false,
                scopeData: {
                    variables: currentScope.variables,
                    name: currentScope.name,
                    objects: currentScope.objects,
                    env: [...currentScope.env, "array_element"],
                },
            });
            currentScope.functions +=
                executedCondition.scope[0].functions + "\n";
            currentScope.packages += executedCondition.scope[0].packages;
            executedCondition = executedCondition.code;
        } else {
            executedCondition = condition;
        }
        executedCondition = conditionLexer(executedCondition);

        executedCondition = executedCondition.solve();

        const res = escapeResult(
            `${escapeVars(name)}.every(array_element => ${parseResult(executedCondition)})`,
        );
        currentScope.update(res, data);

        return {
            code: res,
            scope,
            data,
        };
    },
};
