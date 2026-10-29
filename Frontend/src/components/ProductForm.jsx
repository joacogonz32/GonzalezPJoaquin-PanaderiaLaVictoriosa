import { useState } from 'react'
import FormField, { CheckboxField } from './FormField'
import Button from './Button'
import { validarProducto } from '../utils/validaciones'

const VALORES_INICIALES = {
  nombre: '',
  descripcion: '',
  categoria: '',
  precio: '',
  stock: '0',
  porEncargo: false,
  destacado: false,
}

// Formulario de alta y edición de productos. Si recibe `producto`, se precarga para editar.
export default function ProductForm({ producto, categorias, guardando, onSubmit, onCancel }) {
  const [valores, setValores] = useState(() => (
    producto
      ? { ...producto, precio: String(producto.precio), stock: String(producto.stock) }
      : VALORES_INICIALES
  ))
  const [errores, setErrores] = useState({})

  const cambiar = (evento) => {
    const { name, type, value, checked } = evento.target
    setValores((anteriores) => ({ ...anteriores, [name]: type === 'checkbox' ? checked : value }))
    setErrores((anteriores) => ({ ...anteriores, [name]: undefined }))
  }

  const enviar = (evento) => {
    evento.preventDefault()
    const nuevosErrores = validarProducto(valores)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    onSubmit({
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      categoria: valores.categoria,
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      porEncargo: valores.porEncargo,
      destacado: valores.destacado,
    })
  }

  return (
    <form className="form" onSubmit={enviar} noValidate>
      <FormField
        label="Nombre"
        name="nombre"
        value={valores.nombre}
        onChange={cambiar}
        error={errores.nombre}
        required
        maxLength={80}
      />
      <FormField
        as="textarea"
        label="Descripción"
        name="descripcion"
        value={valores.descripcion}
        onChange={cambiar}
        hint="Se muestra en la card del catálogo."
        maxLength={240}
      />
      <FormField
        as="select"
        label="Categoría"
        name="categoria"
        value={valores.categoria}
        onChange={cambiar}
        error={errores.categoria}
        required
      >
        <option value="">Elegí una categoría</option>
        {categorias.map((categoria) => (
          <option key={categoria} value={categoria}>{categoria}</option>
        ))}
      </FormField>
      <div className="form-row">
        <FormField
          label="Precio ($)"
          name="precio"
          type="number"
          min="1"
          step="any"
          inputMode="decimal"
          value={valores.precio}
          onChange={cambiar}
          error={errores.precio}
          required
        />
        <FormField
          label="Stock del día"
          name="stock"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={valores.stock}
          onChange={cambiar}
          error={errores.stock}
          hint={valores.porEncargo ? 'Los productos por encargo no descuentan stock.' : undefined}
          required
        />
      </div>
      <CheckboxField
        label="Se vende solo por encargo"
        descripcion="Requiere 48 hs de anticipación y no puede incluirse en un pedido regular."
        name="porEncargo"
        checked={valores.porEncargo}
        onChange={cambiar}
      />
      <CheckboxField
        label="Producto destacado"
        descripcion="Aparece en la sección «Nuestros productos estrella» del inicio."
        name="destacado"
        checked={valores.destacado}
        onChange={cambiar}
      />
      <div className="modal__actions">
        <Button variant="secondary" onClick={onCancel} disabled={guardando}>Cancelar</Button>
        <Button type="submit" cargando={guardando}>
          {producto ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
