/**
 * Data Validation object.
 */
class Dvo {
    constructor(dbEntityId, qApplication) {
        if (typeof dbEntityId === 'number') {
            this.dbEntity = qApplication.__dbApplication__.currentVersion[0]
                .applicationVersion.entities[dbEntityId];
        }
        else {
            this.dbEntity = dbEntityId;
        }
    }
    async validate(entity, rules) {
        return null;
    }
}

const and = function (...conditions) {
    throw Error('Implement');
};
const between = function (from, to) {
    throw Error('Implement');
};
const byId = function () {
    throw Error('Implement');
};
const equals = function (valueOrTyped, valueIfTyped) {
    throw Error('Implement');
};
const exists = function (valueOrTyped, valueIfTyped) {
    throw Error('Implement');
};
const isInteger = function (field) {
    throw Error('Implement');
};
const isNotNull = function (validationSpec) {
    throw Error('Implement');
};
const isNull = function (validationSpec) {
    throw Error('Implement');
};
const length = function (from, to) {
    throw Error('Implement');
};
const oneOfNumbers = function (...values) {
    throw Error('Implement');
};
const oneOfStrings = function (...values) {
    throw Error('Implement');
};
const or = function (...conditions) {
    throw Error('Implement');
};
const typed = function (options) {
    throw Error('Implement');
};
const uniqueIn = function (value) {
    throw Error('Implement');
};
const value = function (value) {
    throw Error('Implement');
};

export { Dvo, and, between, byId, equals, exists, isInteger, isNotNull, isNull, length, oneOfNumbers, oneOfStrings, or, typed, uniqueIn, value };
//# sourceMappingURL=index.mjs.map
