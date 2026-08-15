# Marca Identy-Kit

El logotipo es la huella dactilar dentro de un marco de código QR, en azul.
Referencia canónica: public/logo.png (736x812).

## Colores, tomados del propio logo

| Uso | Color |
|---|---|
| Azul profundo — marco, texto principal | `#032F6E` |
| Azul del texto "Identy·kit" | `#00265E` |
| Cian brillante — acento, punto central | `#01B3F4` |
| Cian claro — degradados | `#01BEF7` |

El degradado del marco va de `#032F6E` (arriba izquierda) a `#01B3F4` (abajo derecha).

## Regla

Identy-Kit es AZUL. Cualquier verde, turquesa o teal es de otra versión y no se usa.

El archivo `logo.svg` que existía antes era un escudo turquesa con una línea de
electrocardiograma — otra marca por completo. Se eliminó para que nadie lo tome
por bueno.

## Tipografía del logotipo

Sans geométrica de peso alto, con el punto medio (·) en cian entre "Identy" y "kit".
Bajada: TU IDENTIDAD, SEGURA EN UN QR — en versalitas espaciadas.

## Nota técnica de la base

Las llaves del sistema son UUID, no texto. Al agregar columnas que apunten a
`identities.id` hay que declararlas `uuid`: una columna `text` compila pero
truena en tiempo de ejecución con "operator does not exist: uuid = text",
y solo se descubre cuando alguien usa esa pantalla.
