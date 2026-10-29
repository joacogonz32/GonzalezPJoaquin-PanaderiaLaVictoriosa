import { randomUUID } from 'node:crypto';
import Cliente from '../models/Cliente.js';
import usuarioRepository from '../repositories/UsuarioRepository.js';
import sesionRepository from '../repositories/SesionRepository.js';
import { BadRequestError, ConflictError, UnauthorizedError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { isNonEmptyString, isValidEmail, countDigits } from '../utils/validators.js';

const LONGITUD_MINIMA_CONTRASENA = 6;
const DIGITOS_MINIMOS_TELEFONO = 8;

class AuthService {
    // Solo los clientes se registran desde la web.
    registrar(datos = {}) {
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
        if (usuarioRepository.findByEmail(email.trim())) {
            throw new ConflictError(Messages.USER_EMAIL_DUPLICATED);
        }

        const cliente = new Cliente(
            null, nombre.trim(), email.trim().toLowerCase(), hashPassword(contrasena), telefono.trim()
        );
        usuarioRepository.create(cliente);
        return this.#iniciarSesion(cliente);
    }

    login(datos = {}) {
        const { email, contrasena } = datos;

        if (!isNonEmptyString(email) || !isNonEmptyString(contrasena)) {
            throw new BadRequestError(Messages.LOGIN_REQUIRED_FIELDS);
        }
        if (!isValidEmail(email)) {
            throw new BadRequestError(Messages.USER_INVALID_EMAIL);
        }

        const usuario = usuarioRepository.findByEmail(email.trim());
        if (!usuario || !verifyPassword(contrasena, usuario.contrasena)) {
            throw new UnauthorizedError(Messages.INVALID_CREDENTIALS);
        }
        return this.#iniciarSesion(usuario);
    }

    logout(token) {
        sesionRepository.delete(token);
    }

    obtenerUsuarioPorToken(token) {
        const usuarioId = sesionRepository.findUsuarioId(token);
        const usuario = usuarioId ? usuarioRepository.findById(usuarioId) : null;
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

    #iniciarSesion(usuario) {
        const token = randomUUID();
        sesionRepository.create(token, usuario.id);
        return { token, usuario: this.aDatosPublicos(usuario) };
    }
}

export default new AuthService();
