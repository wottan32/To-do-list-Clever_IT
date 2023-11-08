from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, verify_jwt_in_request
import logging
from logging.handlers import RotatingFileHandler

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
app.config['JWT_SECRET_KEY'] = 'super-secret'  # cambiar por una clave secreta más segura

# configurar el JWT
jwt = JWTManager(app)
db = SQLAlchemy(app)

# poner la clave secreta
app.config['JWT_SECRET_KEY'] = 'super-secret'


class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    due_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Pendiente')

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.strftime('%d/%m/%Y'),
            'status': self.status
        }


class Audit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.String(200))

    def to_json(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'details': self.details
        }

    @staticmethod
    def audit_log(user_id, action, details):
        new_audit = Audit(user_id=user_id, action=action, details=details)
        db.session.add(new_audit)
        db.session.commit()


with app.app_context():
    db.create_all()


@app.before_request
def before_request_func():
    if not request.endpoint:  # Si no hay endpoint, no es una solicitud a la API
        return
    verify_jwt_in_request(optional=True)
    current_user = get_jwt_identity()
    if current_user:  # Si hay un usuario autenticado, registra la acción
        action = f"Requested {request.method} {request.path}"
        details = f"Data: {request.json}" if request.json else "No data"
        Audit.audit_log(user_id=current_user, action=action, details=details)


@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)

    # Aquí deberías validar el nombre de usuario y la contraseña con tu base de datos de usuarios.
    # Para propósitos de ejemplo, estamos utilizando valores estáticos.
    if username != 'test' or password != 'test':
        return jsonify({"msg": "Nombre de usuario o contraseña incorrectos"}), 401

    # Crea un nuevo token con el identificador del usuario dentro y un tiempo de expiración
    expires = timedelta(hours=1)  # El token expira en 1 hora
    access_token = create_access_token(identity=username, expires_delta=expires)
    return jsonify(access_token=access_token), 200


@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    # Accede a la identidad del usuario actual con get_jwt_identity
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@app.route('/todos', methods=['POST'])
def create_todo():
    data = request.json
    new_todo = Todo(
        title=data['title'],
        description=data['description'],
        due_date=datetime.strptime(data['due_date'], '%d/%m/%Y'),
        status=data['status']
    )
    db.session.add(new_todo)
    db.session.commit()
    return jsonify(new_todo.to_json()), 201


@app.route('/todos', methods=['GET'])
def get_todos():
    todos = Todo.query.all()
    return jsonify([todo.to_json() for todo in todos])


@app.route('/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    return jsonify(todo.to_json())


@app.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    data = request.json
    todo.title = data['title']
    todo.description = data['description']
    todo.due_date = datetime.strptime(data['due_date'], '%d/%m/%Y')
    todo.status = data['status']
    db.session.commit()
    return jsonify(todo.to_json())


@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return '', 204


@app.route('/')
def index():
    return render_template('index.html')


if not app.debug:
    # Configuración del log en archivo con rotación
    file_handler = RotatingFileHandler('api_usage.log', maxBytes=1024 * 1024 * 100, backupCount=20)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('API startup')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
