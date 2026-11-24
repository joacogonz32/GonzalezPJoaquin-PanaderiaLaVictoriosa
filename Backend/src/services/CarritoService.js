import Carrito from '../models/Carrito.js';
import ItemCarrito from '../models/ItemCarrito.js';
import carritoRepository from '../repositories/CarritoRepository.js';
import productoRepository from '../repositories/ProductoRepository.js';
import { BadRequestError } from '../exceptions/AppError.js';
import { Messages } from '../enums/Messages.js';
import { isPositiveInteger } from '../utils/validators.js';

// El carrito guarda solo { productoId, cantidad }. Al devolverlo se completa con los datos
// vigentes de cada producto (precio, stock…) y se omiten los que ya no están en el catálogo.
// El stock y las reglas de cada tipo de pedido no se validan acá: se validan al confirmar el pedido.
class CarritoService {
    async obtener(clienteId) {
        const carrito = await carritoRepository.findByClienteId(clienteId);
        return this.#aRespuesta(carrito?.items ?? []);
    }

    // Reemplaza el carrito completo. Una lista vacía equivale a vaciarlo.
    async guardar(clienteId, datos = {}) {
        const lineas = this.#validarItems(datos.items);
        const productos = await productoRepository.findByIds(lineas.map((linea) => linea.productoId));
        const vigentes = lineas.filter((linea) => productos.has(linea.productoId));

        if (vigentes.length === 0) {
            await carritoRepository.delete(clienteId);
        } else {
            const items = vigentes.map(({ productoId, cantidad }) => new ItemCarrito(productoId, cantidad));
            await carritoRepository.save(new Carrito(clienteId, items));
        }
        return this.#armarRespuesta(vigentes, productos);
    }

    async vaciar(clienteId) {
        await carritoRepository.delete(clienteId);
    }

    #validarItems(items) {
        if (!Array.isArray(items)) {
            throw new BadRequestError(Messages.CART_INVALID);
        }

        const idsVistos = new Set();
        return items.map((item) => {
            const { productoId, cantidad } = item ?? {};
            if (!isPositiveInteger(productoId) || !isPositiveInteger(cantidad)) {
                throw new BadRequestError(Messages.CART_INVALID_ITEM);
            }
            if (idsVistos.has(productoId)) {
                throw new BadRequestError(Messages.CART_DUPLICATED_ITEM);
            }
            idsVistos.add(productoId);
            return { productoId, cantidad };
        });
    }

    async #aRespuesta(items) {
        const productos = await productoRepository.findByIds(items.map((item) => item.productoId));
        return this.#armarRespuesta(items, productos);
    }

    #armarRespuesta(items, productos) {
        const lineas = items
            .filter((item) => productos.has(item.productoId))
            .map((item) => ({ producto: productos.get(item.productoId), cantidad: item.cantidad }));

        return {
            items: lineas,
            cantidadTotal: lineas.reduce((suma, linea) => suma + linea.cantidad, 0),
            total: lineas.reduce((suma, linea) => suma + linea.cantidad * linea.producto.precio, 0)
        };
    }
}

export default new CarritoService();
