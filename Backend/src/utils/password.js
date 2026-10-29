import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Las contraseñas nunca se guardan en texto plano: se almacena "salt:hash".
export function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const hashBuffer = Buffer.from(hash, 'hex');
    const candidate = scryptSync(password, salt, 64);
    return timingSafeEqual(hashBuffer, candidate);
}
