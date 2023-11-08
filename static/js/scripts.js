$(document).ready(function() {
    // Inicializar datepicker
    $('#due_date, #editDueDate').datepicker({
        dateFormat: 'dd/mm/yy'
    });

    // Modificar la función loadTodos para aceptar un callback
    function loadTodos(callback) {
        $.ajax({
            url: '/todos',
            type: 'GET',
            success: function(todos) {
                $('#todosList').empty(); // Limpiar la lista actual
                todos.forEach(function(todo) {
                    $('#todosList').append(
                        `<li class="list-group-item" data-id="${todo.id}">
                            <span class="todo-title">${todo.title}</span> - 
                            <span class="todo-description">${todo.description}</span> - 
                            <span class="todo-due-date">${todo.due_date}</span> - 
                            <span class="todo-status">${todo.status}</span>
                            <button onclick="deleteTodo(${todo.id})" class="btn btn-danger btn-sm float-right">Eliminar</button>
                            <button onclick="showEditModal(${todo.id})" class="btn btn-secondary btn-sm float-right mr-2">Editar</button>
                        </li>`
                    );
                });
                if (typeof callback === 'function') {
                    callback(todos);
                }
            },
            error: function() {
                alert('Error al cargar las tareas. Por favor, intente de nuevo.');
            }
        });
    }

    // Cargar todas las tareas al cargar la página
    // function loadTodos() {
    //         $.ajax({
    //             url: '/todos',
    //             type: 'GET',
    //             success: function(todos) {
    //                 $('#todosList').empty(); // Limpiar la lista actual
    //                 todos.forEach(function(todo) {
    //                     $('#todosList').append(
    //                         `<li class="list-group-item" data-id="${todo.id}">
    //                             <span class="todo-title">${todo.title}</span> -
    //                             <span class="todo-description">${todo.description}</span> -
    //                             <span class="todo-due-date">${todo.due_date}</span> -
    //                             <span class="todo-status">${todo.status}</span>
    //                             <button onclick="deleteTodo(${todo.id})" class="btn btn-danger btn-sm float-right">Eliminar</button>
    //                             <button onclick="showEditModal(${todo.id})" class="btn btn-secondary btn-sm float-right mr-2">Editar</button>
    //                         </li>`
    //                     );
    //                 });
    //             },
    //             error: function() {
    //                 alert('Error al cargar las tareas. Por favor, intente de nuevo.');
    //             }
    //         });
    //     }

    // Llamar a loadTodos() al cargar la página
    loadTodos();

   // Evento click para el botón de cargar tareas
    $('#loadTodosButton').click(function() {
        loadTodos(function(todos) {
            if (todos.length === 0) {
                // Si no hay tareas, mostramos un pop-up
                alert('No hay registros.');
            }
        });
    });

    // Manejar la creación de una nueva tarea
    $('#createTodoForm').submit(function(e) {
        e.preventDefault();
        var title = $('#title').val();
        var description = $('#description').val();
        var due_date = $('#due_date').val();
        var status = $('#status').val();

        $.ajax({
            url: '/todos',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                title: title,
                description: description,
                due_date: due_date,
                status: status
            }),
            success: function(response) {
                loadTodos();
                $('#createTodoForm').trigger("reset");
            }
        });
    });

    // Función para eliminar una tarea
    window.deleteTodo = function(todoId) {
    $.ajax({
        url: '/todos/' + todoId,
        type: 'DELETE',
        success: function(result) {
            // Después de eliminar, recargamos la lista de tareas
            loadTodos();
        },
        error: function() {
            alert('Error al eliminar la tarea. Por favor, intente de nuevo.');
        }
    }).then(function() {
        // Después de eliminar, hacemos un GET para verificar si hay más tareas
        $.ajax({
            url: '/todos',
            type: 'GET',
            success: function(todos) {
                if (todos.length === 0) {
                    // Si no hay tareas, mostramos un pop-up
                    alert('No hay registros.');
                }
            },
            error: function() {
                alert('Error al cargar las tareas. Por favor, intente de nuevo.');
            }
        });
        });
    };
    // window.deleteTodo = function(todoId) {
    //     $.ajax({
    //         url: '/todos/' + todoId,
    //         type: 'DELETE',
    //         success: function(result) {
    //             loadTodos();
    //         }
    //     });
    // };

    // Mostrar el modal de edición con los datos de la tarea
    window.showEditModal = function(todoId) {
        $.ajax({
            url: '/todos/' + todoId,
            type: 'GET',
            success: function(todo) {
                $('#editTodoId').val(todo.id);
                $('#editTitle').val(todo.title);
                $('#editDescription').val(todo.description);
                $('#editDueDate').val(todo.due_date);
                $('#editStatus').val(todo.status);
                $('#editTodoModal').modal('show');
            }
        });
    };

    // Función para enviar los datos actualizados a la API
    $('#editTodoForm').submit(function(e) {
        e.preventDefault();
        submitEdit();
    });

    function submitEdit() {
        var todoId = $('#editTodoId').val();
        var title = $('#editTitle').val();
        var description = $('#editDescription').val();
        var due_date = $('#editDueDate').val();
        var status = $('#editStatus').val();

        $.ajax({
            url: '/todos/' + todoId,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                title: title,
                description: description,
                due_date: due_date,
                status: status
            }),
            success: function(response) {
                $('#editTodoModal').modal('hide');
                loadTodos();
            }
        });
    };
});