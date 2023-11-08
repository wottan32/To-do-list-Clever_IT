# Aplicación de Tareas (ToDo App) en Flask

Esta aplicación es una API sencilla para gestionar tareas (todos) desarrollada con Flask.

## Características

- **Autenticación de Usuarios**: Utiliza JWT (JSON Web Tokens) para manejar la autenticación y proteger las rutas.
- **CRUD de Tareas**: Permite crear, leer, actualizar y eliminar tareas (todos).
- **Auditoría**: Registra acciones de los usuarios autenticados para propósitos de auditoría.
- **Vistas**: Incluye una vista simple en HTML para la ruta raíz.

## Tecnologías y Bibliotecas Utilizadas

- **Flask**: Microframework web para Python.
- **Flask-SQLAlchemy**: Extensión de Flask que añade soporte para SQLAlchemy.
- **Flask-JWT-Extended**: Extensión de Flask que facilita el trabajo con JWT.
- **SQLite**: Sistema de gestión de bases de datos SQL utilizado para almacenar los datos de la aplicación.
- **Datetime**: Módulo de Python para manejar operaciones de fecha y hora.
- **Logging**: Módulo de Python para registrar la actividad de la aplicación.

## Estructura de la Base de Datos

La aplicación utiliza dos modelos principales:

- **Todo**: Representa una tarea con atributos como título, descripción, fecha de vencimiento y estado.
- **Audit**: Registra las acciones de los usuarios, incluyendo el ID del usuario, la acción y un timestamp.

## Autenticación

Utiliza JWT para la autenticación de los usuarios. El token proporciona acceso a rutas protegidas y se valida en cada solicitud.

## Endpoints

- `POST /login`: Autentica al usuario y devuelve un token de acceso.
- `GET /protected`: Ruta de prueba para validar el token de acceso.
- `POST /todos`: Crea una nueva tarea.
- `GET /todos`: Obtiene todas las tareas.
- `GET /todos/<int:todo_id>`: Obtiene una tarea específica por ID.
- `PUT /todos/<int:todo_id>`: Actualiza una tarea existente.
- `DELETE /todos/<int:todo_id>`: Elimina una tarea.

## Despliegue

Para ejecutar la aplicación en modo de desarrollo:

```bash
python main.py
