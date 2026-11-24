// Categorías iniciales que "npm run seed" carga en la colección "categorias" de Firestore.
// Una vez cargadas, la lista válida es la de la base: este archivo solo se usa al inicializarla.
export const Categorias = Object.freeze({
    FACTURAS: "Facturas",
    PANES: "Panes",
    SANDWICHES: "Sándwiches",
    REPOSTERIA: "Repostería"
});

export const categoriasIniciales = Object.freeze(Object.values(Categorias));
