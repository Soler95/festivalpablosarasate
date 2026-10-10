# Festival Pablo Sarasate

Web estática del Festival Internacional de Violín Pablo Sarasate (Pamplona, 8–14 de marzo de 2027).

## Páginas

| Español | English |
| --- | --- |
| `index.html` | `en/index.html` |
| `inscripcion.html` | `en/masterclasses.html` |
| `dia.html` | `en/day.html` |
| `edicionesanteriores.html` | `en/past-editions.html` |
| `legal.html` | `en/legal.html` |

## Cosas que se cambian a menudo

- **Programa:** pega la URL CSV de la hoja de Google en `SHEET_CSV_URL` (`programa.js`). Mientras esté vacía, la web muestra «Programa próximamente». Para ver el diseño con eventos de ejemplo, abre `index.html?demo`.
- **Formulario de inscripción:** URL de Google Forms en `FORM_URL` (`programa.js`).
- **Precios:** en `inscripcion.html` y `en/masterclasses.html`, cambia `<dd class="tba">Por anunciar</dd>` por `<dd>250 €</dd>`.
- **Fotos de artistas:** ver el comentario en la sección `#artistas` de `index.html`.
- **Aviso legal:** completa titular, NIF/CIF y domicilio en `legal.html` y `en/legal.html` (busca `todo`).

Las tipografías (Source Serif 4, Instrument Sans) están en `fonts/` con licencia SIL OFL.
