import { Categorias } from '../enums/Categorias.js';

// Catálogo inicial cargado en memoria al iniciar el servidor.
export const productosIniciales = [
    {
        nombre: "Medialunas de manteca",
        descripcion: "Receta tradicional, esponjosas y recién horneadas. Precio por docena.",
        precio: 4800, stock: 40, categoria: Categorias.FACTURAS, destacado: true, porEncargo: false
    },
    {
        nombre: "Medialunas de grasa",
        descripcion: "Crocantes y saladitas, ideales para el mate. Precio por docena.",
        precio: 4500, stock: 35, categoria: Categorias.FACTURAS, destacado: false, porEncargo: false
    },
    {
        nombre: "Vigilantes con membrillo",
        descripcion: "Hojaldre con dulce de membrillo y azúcar glas. Precio por docena.",
        precio: 5200, stock: 20, categoria: Categorias.FACTURAS, destacado: false, porEncargo: false
    },
    {
        nombre: "Pan francés",
        descripcion: "Flautitas y miñones de corteza crocante, horneados en varios turnos. Precio por kilo.",
        precio: 2600, stock: 60, categoria: Categorias.PANES, destacado: false, porEncargo: false
    },
    {
        nombre: "Pan de campo",
        descripcion: "Masa madre, fermentación lenta y miga húmeda. Unidad de 800 g.",
        precio: 3900, stock: 15, categoria: Categorias.PANES, destacado: false, porEncargo: false
    },
    {
        nombre: "Prepizza artesanal",
        descripcion: "Bollo de masa con salsa casera, listo para hornear en casa.",
        precio: 2200, stock: 25, categoria: Categorias.PANES, destacado: false, porEncargo: false
    },
    {
        nombre: "Sándwiches de miga surtidos",
        descripcion: "Jamón y queso, lechuga y tomate, ananá y huevo. Ingredientes frescos del día. Precio por docena.",
        precio: 9600, stock: 0, categoria: Categorias.SANDWICHES, destacado: true, porEncargo: true
    },
    {
        nombre: "Sándwiches de miga triples",
        descripcion: "Triples de jamón, queso y huevo para reuniones y eventos. Precio por docena.",
        precio: 12500, stock: 0, categoria: Categorias.SANDWICHES, destacado: false, porEncargo: true
    },
    {
        nombre: "Torta de cumpleaños",
        descripcion: "Bizcochuelo relleno con dulce de leche y crema, decorada a gusto. Para 20 porciones.",
        precio: 38000, stock: 0, categoria: Categorias.REPOSTERIA, destacado: true, porEncargo: true
    },
    {
        nombre: "Masas finas surtidas",
        descripcion: "Bandeja de masas secas y masas finas para sobremesas. Precio por medio kilo.",
        precio: 11000, stock: 0, categoria: Categorias.REPOSTERIA, destacado: false, porEncargo: true
    },
    {
        nombre: "Pasta frola",
        descripcion: "Masa casera con dulce de membrillo o batata. Tarta mediana.",
        precio: 6500, stock: 8, categoria: Categorias.REPOSTERIA, destacado: false, porEncargo: false
    }
];
