const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

export function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
}

export function isValidEmail(value) {
    return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

export function countDigits(value) {
    return typeof value === 'string' ? value.replace(/\D/g, '').length : 0;
}
