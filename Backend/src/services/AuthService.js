import { randomUUID } from 'node:crypto';
import Cliente from '../models/Cliente.js';
import usuarioRepository from '../repositories/UsuarioRepository.js';
import sesionRepository from '../repositories/SesionRepository.js';
import { ejecutarTransaccion } from '../repositories/transacciones.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { isNonEmptyString, isValidEmail, countDigits } from '../utils/validators.js';

const LONGITUD_MINIMA_CONTRASENA = 6;
const DIGITOS_MINIMOS_TELEFONO = 8;

class AuthService {
    // Solo los clientes se registran desde la web.
    async registrar(datos = {}) {
        const { nombre, email, contrasena, telefono } = datos;

        if (![nombre, email, contrasena, telefono].every(isNonEmptyString)) {
            throw new BadRequestError(Messages.USER_REQUIRED_FIELDS);
        }
        if (!isValidEmail(email)) {
            throw new BadRequestError(Messages.USER_INVALID_EMAIL);
        }
        if (contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
            throw new BadRequestError(Messages.USER_SHORT_PASSWORD);
        }
        if (countDigits(telefono) < DIGITOS_MINIMOS_TELEFONO) {
            throw new BadRequestError(Messages.USER_INVALID_PHONE);
        }

        const contrasenaHasheada = hashPassword(contrasena);

        // La verificación del email y el alta van en la misma transacción
        // para que dos registros simultáneos no creen el mismo email dos veces.
        const cliente = await ejecutarTransaccion(async (tx) => {
            if (await usuarioRepository.findByEmail(email, tx)) {
                throw new ConflictError(Messages.USER_EMAIL_DUPLICATED);
            }
            const nuevoCliente = new Cliente(
                null, nombre.trim(), email.trim().toLowerCase(), contrasenaHasheada, telefono.trim()
            );
            return usuarioRepository.create(nuevoCliente, tx);
        });

        return this.#iniciarSesion(cliente);
    }

    async login(datos = {}) {
        const { email, contrasena } = datos;

        if (!isNonEmptyString(email) || !isNonEmptyString(contrasena)) {
            throw new BadRequestError(Messages.LOGIN_REQUIRED_FIELDS);
        }
        if (!isValidEmail(email)) {
            throw new BadRequestError(Messages.USER_INVALID_EMAIL);
        }

        const usuario = await usuarioRepository.findByEmail(email);
        if (!usuario || !verifyPassword(contrasena, usuario.contrasena)) {
            throw new UnauthorizedError(Messages.INVALID_CREDENTIALS);
        }
        return this.#iniciarSesion(usuario);
    }

    async logout(token) {
        await sesionRepository.delete(token);
    }

    async obtenerUsuarioPorToken(token) {
        const usuarioId = await sesionRepository.findUsuarioId(token);
        const usuario = usuarioId ? await usuarioRepository.findById(usuarioId) : null;
        if (!usuario) {
            throw new UnauthorizedError(Messages.INVALID_SESSION);
        }
        return usuario;
    }

    // Datos del usuario que pueden enviarse al cliente (sin la contraseña).
    aDatosPublicos(usuario) {
        const { contrasena, ...datosPublicos } = usuario;
        return datosPublicos;
    }

    async #iniciarSesion(usuario) {
        const token = randomUUID();
        await sesionRepository.create(token, usuario.id);
        return { token, usuario: this.aDatosPublicos(usuario) };
    }
}

export default new AuthService();
